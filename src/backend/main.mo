import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let approvalState = UserApproval.initState(accessControlState);

  // ==================== TYPES ====================

  public type AvailabilityStatus = { #available; #busy; #travelling };
  public type RelationStatus = { #pending; #confirmed; #rejected };
  public type RelationType = {
    #father; #mother; #brother; #sister; #spouse; #child;
    #cousin; #uncle; #aunt; #nephew; #niece;
    #grandparent; #grandchild; #friend; #other : Text
  };
  public type NotificationType = {
    #joinApproved; #joinRejected; #relationRequest;
    #relationConfirmed; #relationRejected; #profileVerified;
    #storyPosted; #birthdayReminder; #anniversaryReminder; #profileUpdated
  };
  public type ActivityType = {
    #memberJoined; #relationConfirmed; #storyShared; #profileUpdated; #memberRemoved
  };

  public type ImportantDate = {
    dateLabel: Text;
    month: Nat;
    day: Nat;
    year: ?Nat;
  };

  public type UserProfile = {
    principal: Principal;
    name: Text;
    gender: Text;
    dateOfBirth: ?ImportantDate;
    phone: Text;
    hometown: Text;
    currentLocation: Text;
    bio: Text;
    profilePhotoKey: ?Text;
    availabilityStatus: AvailabilityStatus;
    isVerified: Bool;
    importantDates: [ImportantDate];
    joinedAt: Int;
  };

  public type Relation = {
    id: Text;
    fromUser: Principal;
    toUser: Principal;
    relationType: RelationType;
    status: RelationStatus;
    createdAt: Int;
    updatedAt: Int;
  };

  public type Story = {
    id: Text;
    author: Principal;
    textContent: ?Text;
    mediaBlobKey: ?Text;
    createdAt: Int;
    expiresAt: Int;
  };

  public type Notification = {
    id: Text;
    recipient: Principal;
    notifType: NotificationType;
    message: Text;
    fromUser: ?Principal;
    isRead: Bool;
    createdAt: Int;
  };

  public type ActivityEntry = {
    id: Text;
    actorId: Principal;
    activityType: ActivityType;
    description: Text;
    createdAt: Int;
  };

  // ==================== STATE ====================

  var profileEntries : [(Text, UserProfile)] = [];
  var relationEntries : [(Text, Relation)] = [];
  var storyEntries : [(Text, Story)] = [];
  var notificationEntries : [(Text, Notification)] = [];
  var activityEntries : [(Text, ActivityEntry)] = [];
  var nextId : Nat = 0;

  var profiles = Map.fromIter<Text, UserProfile>(profileEntries.vals());
  var relations = Map.fromIter<Text, Relation>(relationEntries.vals());
  var stories = Map.fromIter<Text, Story>(storyEntries.vals());
  var notifications = Map.fromIter<Text, Notification>(notificationEntries.vals());
  var activities = Map.fromIter<Text, ActivityEntry>(activityEntries.vals());

  func genId() : Text {
    nextId := nextId + 1;
    Time.now().toText() # "-" # nextId.toText()
  };

  func isApprovedUser(caller: Principal) : Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller)
  };

  func isAdmin(caller: Principal) : Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin)
  };

  func addNotification(recipient: Principal, notifType: NotificationType, message: Text, fromUser: ?Principal) {
    let id = genId();
    let notif : Notification = {
      id;
      recipient;
      notifType;
      message;
      fromUser;
      isRead = false;
      createdAt = Time.now();
    };
    notifications.add(id, notif);
  };

  func addActivity(actorPrincipal: Principal, activityType: ActivityType, description: Text) {
    let id = genId();
    let entry : ActivityEntry = {
      id;
      actorId = actorPrincipal;
      activityType;
      description;
      createdAt = Time.now();
    };
    activities.add(id, entry);
  };

  // ==================== APPROVAL ====================

  public query ({ caller }) func isCallerApproved() : async Bool {
    isApprovedUser(caller)
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user: Principal, status: UserApproval.ApprovalStatus) : async () {
    if (not isAdmin(caller)) { Runtime.trap("Unauthorized") };
    UserApproval.setApproval(approvalState, user, status);
    if (status == #approved) {
      addNotification(user, #joinApproved, "Your request to join the family has been approved!", null);
      addActivity(user, #memberJoined, "A new member joined the family.");
    } else if (status == #rejected) {
      addNotification(user, #joinRejected, "Your request to join the family was rejected.", null);
    };
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not isAdmin(caller)) { Runtime.trap("Unauthorized") };
    UserApproval.listApprovals(approvalState)
  };

  // ==================== PROFILES ====================

  public shared ({ caller }) func upsertProfile(profile: UserProfile) : async () {
    if (not isApprovedUser(caller)) { Runtime.trap("Not approved") };
    let updated : UserProfile = {
      principal = caller;
      name = profile.name;
      gender = profile.gender;
      dateOfBirth = profile.dateOfBirth;
      phone = profile.phone;
      hometown = profile.hometown;
      currentLocation = profile.currentLocation;
      bio = profile.bio;
      profilePhotoKey = profile.profilePhotoKey;
      availabilityStatus = profile.availabilityStatus;
      isVerified = false;
      importantDates = profile.importantDates;
      joinedAt = profile.joinedAt;
    };
    profiles.add(caller.toText(), updated);
    addActivity(caller, #profileUpdated, "A member updated their profile.");
  };

  public query func getProfile(user: Principal) : async ?UserProfile {
    profiles.get(user.toText())
  };

  public query ({ caller }) func getMyProfile() : async ?UserProfile {
    profiles.get(caller.toText())
  };

  public query func listMembers() : async [UserProfile] {
    profiles.values().toArray()
  };

  public query func searchMembers(searchQuery: Text) : async [UserProfile] {
    let lq = searchQuery.toLower();
    profiles.values().toArray().filter(
      func(p: UserProfile) : Bool {
        p.name.toLower().contains(#text lq) or
        p.hometown.toLower().contains(#text lq) or
        p.currentLocation.toLower().contains(#text lq)
      }
    )
  };

  public shared ({ caller }) func verifyProfile(user: Principal) : async () {
    if (not isAdmin(caller)) { Runtime.trap("Unauthorized") };
    let key = user.toText();
    switch (profiles.get(key)) {
      case (?p) {
        profiles.add(key, {
          principal = p.principal;
          name = p.name;
          gender = p.gender;
          dateOfBirth = p.dateOfBirth;
          phone = p.phone;
          hometown = p.hometown;
          currentLocation = p.currentLocation;
          bio = p.bio;
          profilePhotoKey = p.profilePhotoKey;
          availabilityStatus = p.availabilityStatus;
          isVerified = true;
          importantDates = p.importantDates;
          joinedAt = p.joinedAt;
        });
        addNotification(user, #profileVerified, "Your profile has been verified by an admin!", ?caller);
      };
      case null {};
    };
  };

  public shared ({ caller }) func adminUpdateProfile(user: Principal, profile: UserProfile) : async () {
    if (not isAdmin(caller)) { Runtime.trap("Unauthorized") };
    profiles.add(user.toText(), {
      principal = user;
      name = profile.name;
      gender = profile.gender;
      dateOfBirth = profile.dateOfBirth;
      phone = profile.phone;
      hometown = profile.hometown;
      currentLocation = profile.currentLocation;
      bio = profile.bio;
      profilePhotoKey = profile.profilePhotoKey;
      availabilityStatus = profile.availabilityStatus;
      isVerified = profile.isVerified;
      importantDates = profile.importantDates;
      joinedAt = profile.joinedAt;
    });
  };

  public shared ({ caller }) func setAvailabilityStatus(status: AvailabilityStatus) : async () {
    let key = caller.toText();
    switch (profiles.get(key)) {
      case (?p) {
        profiles.add(key, {
          principal = p.principal;
          name = p.name;
          gender = p.gender;
          dateOfBirth = p.dateOfBirth;
          phone = p.phone;
          hometown = p.hometown;
          currentLocation = p.currentLocation;
          bio = p.bio;
          profilePhotoKey = p.profilePhotoKey;
          availabilityStatus = status;
          isVerified = p.isVerified;
          importantDates = p.importantDates;
          joinedAt = p.joinedAt;
        });
      };
      case null { Runtime.trap("Profile not found") };
    };
  };

  public shared ({ caller }) func removeMember(user: Principal) : async () {
    if (not isAdmin(caller)) { Runtime.trap("Unauthorized") };
    profiles.remove(user.toText());
    addActivity(caller, #memberRemoved, "A member was removed from the family.");
  };

  // ==================== RELATIONS ====================

  public shared ({ caller }) func requestRelation(toUser: Principal, relationType: RelationType) : async () {
    if (not isApprovedUser(caller)) { Runtime.trap("Not approved") };
    let id = genId();
    let rel : Relation = {
      id;
      fromUser = caller;
      toUser;
      relationType;
      status = #pending;
      createdAt = Time.now();
      updatedAt = Time.now();
    };
    relations.add(id, rel);
    let typeName = relationTypeToText(relationType);
    addNotification(toUser, #relationRequest, "You have a new relation request: " # typeName, ?caller);
  };

  public shared ({ caller }) func respondRelation(relationId: Text, accept: Bool) : async () {
    switch (relations.get(relationId)) {
      case (?rel) {
        if (rel.toUser != caller) { Runtime.trap("Not authorized") };
        let newStatus : RelationStatus = if accept { #confirmed } else { #rejected };
        relations.add(relationId, {
          id = rel.id;
          fromUser = rel.fromUser;
          toUser = rel.toUser;
          relationType = rel.relationType;
          status = newStatus;
          createdAt = rel.createdAt;
          updatedAt = Time.now();
        });
        let notifType : NotificationType = if accept { #relationConfirmed } else { #relationRejected };
        let msg = if accept { "Your relation request was accepted!" } else { "Your relation request was declined." };
        addNotification(rel.fromUser, notifType, msg, ?caller);
        if accept {
          addActivity(caller, #relationConfirmed, "A new family relation was confirmed.");
        };
      };
      case null { Runtime.trap("Relation not found") };
    };
  };

  public query func getRelationsForUser(user: Principal) : async [Relation] {
    let uid = user.toText();
    relations.values().toArray().filter(
      func(r: Relation) : Bool {
        r.fromUser.toText() == uid or r.toUser.toText() == uid
      }
    )
  };

  public shared ({ caller }) func adminDeleteRelation(relationId: Text) : async () {
    if (not isAdmin(caller)) { Runtime.trap("Unauthorized") };
    relations.remove(relationId);
  };

  public shared ({ caller }) func adminUpsertRelation(rel: Relation) : async () {
    if (not isAdmin(caller)) { Runtime.trap("Unauthorized") };
    relations.add(rel.id, rel);
  };

  func relationTypeToText(t: RelationType) : Text {
    switch t {
      case (#father) "Father";
      case (#mother) "Mother";
      case (#brother) "Brother";
      case (#sister) "Sister";
      case (#spouse) "Spouse";
      case (#child) "Child";
      case (#cousin) "Cousin";
      case (#uncle) "Uncle";
      case (#aunt) "Aunt";
      case (#nephew) "Nephew";
      case (#niece) "Niece";
      case (#grandparent) "Grandparent";
      case (#grandchild) "Grandchild";
      case (#friend) "Friend";
      case (#other t) t;
    }
  };

  // ==================== STORIES ====================

  public shared ({ caller }) func createStory(textContent: ?Text, mediaBlobKey: ?Text) : async () {
    if (not isApprovedUser(caller)) { Runtime.trap("Not approved") };
    let id = genId();
    let now = Time.now();
    let story : Story = {
      id;
      author = caller;
      textContent;
      mediaBlobKey;
      createdAt = now;
      expiresAt = now + 86_400_000_000_000;
    };
    stories.add(id, story);
    addActivity(caller, #storyShared, "A member shared a new story.");
    for (profile in profiles.values()) {
      if (profile.principal != caller) {
        addNotification(profile.principal, #storyPosted, "A family member shared a new story!", ?caller);
      };
    };
  };

  public query func listActiveStories() : async [Story] {
    let now = Time.now();
    stories.values().toArray().filter(
      func(s: Story) : Bool { s.expiresAt > now }
    )
  };

  public shared ({ caller }) func deleteStory(storyId: Text) : async () {
    switch (stories.get(storyId)) {
      case (?s) {
        if (s.author != caller and not isAdmin(caller)) { Runtime.trap("Unauthorized") };
        stories.remove(storyId);
      };
      case null { Runtime.trap("Story not found") };
    };
  };

  // ==================== NOTIFICATIONS ====================

  public query ({ caller }) func getMyNotifications() : async [Notification] {
    let callerText = caller.toText();
    notifications.values().toArray().filter(
      func(n: Notification) : Bool {
        n.recipient.toText() == callerText
      }
    )
  };

  public shared ({ caller }) func markNotificationRead(notifId: Text) : async () {
    switch (notifications.get(notifId)) {
      case (?n) {
        if (n.recipient != caller) { Runtime.trap("Unauthorized") };
        notifications.add(notifId, {
          id = n.id;
          recipient = n.recipient;
          notifType = n.notifType;
          message = n.message;
          fromUser = n.fromUser;
          isRead = true;
          createdAt = n.createdAt;
        });
      };
      case null {};
    };
  };

  public shared ({ caller }) func markAllNotificationsRead() : async () {
    for ((id, notif) in notifications.entries()) {
      if (notif.recipient == caller) {
        notifications.add(id, {
          id = notif.id;
          recipient = notif.recipient;
          notifType = notif.notifType;
          message = notif.message;
          fromUser = notif.fromUser;
          isRead = true;
          createdAt = notif.createdAt;
        });
      };
    };
  };

  // ==================== TIMELINE ====================

  public query func getTimeline() : async [ActivityEntry] {
    activities.values().toArray().sort(
      func(a: ActivityEntry, b: ActivityEntry) : Order.Order {
        if (a.createdAt > b.createdAt) { #less }
        else if (a.createdAt < b.createdAt) { #greater }
        else { #equal }
      }
    )
  };

  // ==================== UPCOMING DATES ====================

  public query func getUpcomingBirthdays(_withinDays: Nat) : async [UserProfile] {
    profiles.values().toArray()
  };

};
