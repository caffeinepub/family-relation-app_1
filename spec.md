# Family Relation App

## Current State
New project. Empty Motoko backend and no frontend yet.

## Requested Changes (Diff)

### Add
- Email/password authentication with default admin account (thoufeeq2mohd@gmail.com / Thoufeeq@123)
- User join request system (pending approval by admin)
- Full profile system: name, gender, DOB, phone, hometown, current location, profile photo, bio, important dates (wedding anniversary, engagement, custom dates)
- Availability status: Available / Busy / Travelling (visible on profile)
- Admin system: Main Admin + multiple admins, approve/reject users, verify profiles, promote/remove admins
- Relation system: add relationships (Father, Mother, Brother, Sister, Spouse, Child, Cousin, etc.) with mutual confirmation, edit confirmation, notifications
- Member management: list/search members, show roles, admin can remove/promote members
- Story/Status system: upload photo/text status, visible family-only, auto-delete after 24h, admin can delete any
- Notification system: in-app notifications for join requests, relation changes, profile updates, story uploads, birthday/anniversary reminders
- Profile verification badge (admin-verified)
- Family timeline / activity feed
- Birthday and anniversary reminders

### Modify
- None (new project)

### Remove
- None

## Implementation Plan
1. Use `authorization` component for role-based access (Admin, Member roles)
2. Use `user-approval` component for join request workflow
3. Use `blob-storage` for profile photos and story media
4. Backend actors:
   - UserActor: user profiles, availability status, verification badge
   - RelationActor: relation requests, confirmations, relation types
   - StoryActor: stories with expiry, 24h auto-delete logic
   - NotificationActor: in-app notifications queue per user
   - TimelineActor: activity feed entries
5. Frontend pages:
   - Login / Register / Join Request page
   - Admin approval panel
   - Home (Stories bar + Timeline feed, WhatsApp-style)
   - Members list with search
   - Profile page (own + others)
   - Relations page / Family tree view
   - Notifications panel
   - Admin dashboard (manage members, relations, stories)
   - Settings / Edit profile
