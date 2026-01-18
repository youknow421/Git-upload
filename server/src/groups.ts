export interface GroupMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface GroupInvite {
  id: string;
  groupId: string;
  email: string;
  invitedBy: string;
  inviterName: string;
  token: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  expiresAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  members: GroupMember[];
  sharedCart: string[];
  invites: GroupInvite[];
  createdAt: string;
  expiresAt: string | null; // null = never expires
  isArchived: boolean;
  settings: {
    allowMemberInvites: boolean;
    digestFrequency: 'daily' | 'weekly' | 'none';
    autoExpireDays: number | null; // null = never
  };
}

export interface GroupActivity {
  id: string;
  groupId: string;
  type: 'member_joined' | 'member_left' | 'item_added' | 'item_removed' | 'invite_sent' | 'group_updated';
  userId: string;
  userName: string;
  details: string;
  timestamp: string;
}

// In-memory storage (ready for database)
const groups: Map<string, Group> = new Map();
const groupActivities: Map<string, GroupActivity[]> = new Map();

// Helper to generate tokens
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Date.now().toString(36);
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Create a new group
export function createGroup(
  ownerId: string,
  ownerName: string,
  ownerEmail: string,
  name: string,
  description: string,
  expiresInDays?: number
): Group {
  const id = generateId();
  const now = new Date().toISOString();
  
  const group: Group = {
    id,
    name,
    description,
    ownerId,
    ownerName,
    members: [{
      id: generateId(),
      userId: ownerId,
      name: ownerName,
      email: ownerEmail,
      role: 'owner',
      joinedAt: now
    }],
    sharedCart: [],
    invites: [],
    createdAt: now,
    expiresAt: expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null,
    isArchived: false,
    settings: {
      allowMemberInvites: true,
      digestFrequency: 'weekly',
      autoExpireDays: null
    }
  };

  groups.set(id, group);
  groupActivities.set(id, []);
  
  logActivity(id, ownerId, ownerName, 'group_updated', `Created group "${name}"`);
  
  return group;
}

// Get group by ID
export function getGroup(groupId: string): Group | undefined {
  const group = groups.get(groupId);
  if (group && !group.isArchived) {
    // Check if expired
    if (group.expiresAt && new Date(group.expiresAt) < new Date()) {
      group.isArchived = true;
      groups.set(groupId, group);
      return undefined;
    }
    return group;
  }
  return undefined;
}

// Get groups for a user
export function getUserGroups(userId: string): Group[] {
  const userGroups: Group[] = [];
  
  groups.forEach(group => {
    if (group.isArchived) return;
    
    // Check expiration
    if (group.expiresAt && new Date(group.expiresAt) < new Date()) {
      group.isArchived = true;
      groups.set(group.id, group);
      return;
    }
    
    // Check if user is a member
    if (group.members.some(m => m.userId === userId)) {
      userGroups.push(group);
    }
  });
  
  return userGroups.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Update group
export function updateGroup(
  groupId: string, 
  userId: string,
  updates: Partial<Pick<Group, 'name' | 'description' | 'settings' | 'expiresAt'>>
): Group | null {
  const group = getGroup(groupId);
  if (!group) return null;
  
  // Check permission (owner or admin)
  const member = group.members.find(m => m.userId === userId);
  if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
    return null;
  }
  
  const updatedGroup = { ...group, ...updates };
  groups.set(groupId, updatedGroup);
  
  logActivity(groupId, userId, member.name, 'group_updated', 'Updated group settings');
  
  return updatedGroup;
}

// Delete/archive group
export function deleteGroup(groupId: string, userId: string): boolean {
  const group = getGroup(groupId);
  if (!group) return false;
  
  // Only owner can delete
  const member = group.members.find(m => m.userId === userId);
  if (!member || member.role !== 'owner') {
    return false;
  }
  
  group.isArchived = true;
  groups.set(groupId, group);
  return true;
}

// Create invite
export function createInvite(
  groupId: string,
  invitedByUserId: string,
  inviterName: string,
  email: string,
  expiresInDays: number = 7
): GroupInvite | null {
  const group = getGroup(groupId);
  if (!group) return null;
  
  // Check permission
  const member = group.members.find(m => m.userId === invitedByUserId);
  if (!member) return null;
  if (member.role === 'member' && !group.settings.allowMemberInvites) {
    return null;
  }
  
  // Check if already a member
  if (group.members.some(m => m.email.toLowerCase() === email.toLowerCase())) {
    return null;
  }
  
  // Check for existing pending invite
  const existingInvite = group.invites.find(
    i => i.email.toLowerCase() === email.toLowerCase() && i.status === 'pending'
  );
  if (existingInvite) {
    return existingInvite; // Return existing invite
  }
  
  const invite: GroupInvite = {
    id: generateId(),
    groupId,
    email: email.toLowerCase(),
    invitedBy: invitedByUserId,
    inviterName,
    token: generateToken(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
  };
  
  group.invites.push(invite);
  groups.set(groupId, group);
  
  logActivity(groupId, invitedByUserId, inviterName, 'invite_sent', `Sent invite to ${email}`);
  
  return invite;
}

// Get invite by token
export function getInviteByToken(token: string): { invite: GroupInvite; group: Group } | null {
  for (const group of groups.values()) {
    const invite = group.invites.find(i => i.token === token);
    if (invite) {
      // Check if expired
      if (new Date(invite.expiresAt) < new Date() && invite.status === 'pending') {
        invite.status = 'expired';
        groups.set(group.id, group);
        return null;
      }
      if (invite.status === 'pending') {
        return { invite, group };
      }
    }
  }
  return null;
}

// Get pending invites for an email
export function getPendingInvitesForEmail(email: string): { invite: GroupInvite; group: Group }[] {
  const result: { invite: GroupInvite; group: Group }[] = [];
  
  groups.forEach(group => {
    if (group.isArchived) return;
    
    group.invites.forEach(invite => {
      if (invite.email.toLowerCase() === email.toLowerCase() && invite.status === 'pending') {
        // Check expiration
        if (new Date(invite.expiresAt) < new Date()) {
          invite.status = 'expired';
        } else {
          result.push({ invite, group });
        }
      }
    });
  });
  
  return result;
}

// Accept invite
export function acceptInvite(
  token: string,
  userId: string,
  userName: string,
  userEmail: string
): Group | null {
  const result = getInviteByToken(token);
  if (!result) return null;
  
  const { invite, group } = result;
  
  // Verify email matches
  if (invite.email.toLowerCase() !== userEmail.toLowerCase()) {
    return null;
  }
  
  // Add member
  const newMember: GroupMember = {
    id: generateId(),
    userId,
    name: userName,
    email: userEmail,
    role: 'member',
    joinedAt: new Date().toISOString()
  };
  
  group.members.push(newMember);
  invite.status = 'accepted';
  groups.set(group.id, group);
  
  logActivity(group.id, userId, userName, 'member_joined', `${userName} joined the group`);
  
  return group;
}

// Decline invite
export function declineInvite(token: string, userEmail: string): boolean {
  const result = getInviteByToken(token);
  if (!result) return false;
  
  const { invite, group } = result;
  
  if (invite.email.toLowerCase() !== userEmail.toLowerCase()) {
    return false;
  }
  
  invite.status = 'declined';
  groups.set(group.id, group);
  return true;
}

// Cancel invite (by group admin/owner)
export function cancelInvite(groupId: string, inviteId: string, userId: string): boolean {
  const group = getGroup(groupId);
  if (!group) return false;
  
  const member = group.members.find(m => m.userId === userId);
  if (!member || member.role === 'member') return false;
  
  const invite = group.invites.find(i => i.id === inviteId);
  if (!invite || invite.status !== 'pending') return false;
  
  invite.status = 'expired';
  groups.set(groupId, group);
  return true;
}

// Remove member
export function removeMember(groupId: string, memberId: string, userId: string): boolean {
  const group = getGroup(groupId);
  if (!group) return false;
  
  const actingMember = group.members.find(m => m.userId === userId);
  const targetMember = group.members.find(m => m.id === memberId);
  
  if (!actingMember || !targetMember) return false;
  
  // Owner cannot be removed
  if (targetMember.role === 'owner') return false;
  
  // Self-removal or admin/owner removing
  if (actingMember.userId === targetMember.userId || 
      actingMember.role === 'owner' || 
      (actingMember.role === 'admin' && targetMember.role === 'member')) {
    
    group.members = group.members.filter(m => m.id !== memberId);
    groups.set(groupId, group);
    
    logActivity(groupId, userId, actingMember.name, 'member_left', 
      `${targetMember.name} left the group`);
    
    return true;
  }
  
  return false;
}

// Update member role
export function updateMemberRole(
  groupId: string, 
  memberId: string, 
  newRole: GroupMember['role'],
  userId: string
): boolean {
  const group = getGroup(groupId);
  if (!group) return false;
  
  const actingMember = group.members.find(m => m.userId === userId);
  const targetMember = group.members.find(m => m.id === memberId);
  
  if (!actingMember || !targetMember) return false;
  
  // Only owner can change roles
  if (actingMember.role !== 'owner') return false;
  
  // Cannot change owner role
  if (targetMember.role === 'owner') return false;
  if (newRole === 'owner') return false;
  
  targetMember.role = newRole;
  groups.set(groupId, group);
  
  logActivity(groupId, userId, actingMember.name, 'group_updated',
    `Changed ${targetMember.name}'s role to ${newRole}`);
  
  return true;
}

// Shared cart operations
export function addToSharedCart(groupId: string, productId: string, userId: string): boolean {
  const group = getGroup(groupId);
  if (!group) return false;
  
  const member = group.members.find(m => m.userId === userId);
  if (!member) return false;
  
  if (!group.sharedCart.includes(productId)) {
    group.sharedCart.push(productId);
    groups.set(groupId, group);
    
    logActivity(groupId, userId, member.name, 'item_added', `Added item to shared cart`);
  }
  
  return true;
}

export function removeFromSharedCart(groupId: string, productId: string, userId: string): boolean {
  const group = getGroup(groupId);
  if (!group) return false;
  
  const member = group.members.find(m => m.userId === userId);
  if (!member) return false;
  
  const index = group.sharedCart.indexOf(productId);
  if (index > -1) {
    group.sharedCart.splice(index, 1);
    groups.set(groupId, group);
    
    logActivity(groupId, userId, member.name, 'item_removed', `Removed item from shared cart`);
  }
  
  return true;
}

// Activity logging
function logActivity(
  groupId: string,
  userId: string,
  userName: string,
  type: GroupActivity['type'],
  details: string
) {
  const activity: GroupActivity = {
    id: generateId(),
    groupId,
    type,
    userId,
    userName,
    details,
    timestamp: new Date().toISOString()
  };
  
  const activities = groupActivities.get(groupId) || [];
  activities.unshift(activity);
  
  // Keep last 100 activities
  if (activities.length > 100) {
    activities.pop();
  }
  
  groupActivities.set(groupId, activities);
}

// Get group activity
export function getGroupActivity(groupId: string, limit: number = 20): GroupActivity[] {
  const activities = groupActivities.get(groupId) || [];
  return activities.slice(0, limit);
}

// Get activity for digest
export function getActivityForDigest(
  groupId: string, 
  since: Date
): GroupActivity[] {
  const activities = groupActivities.get(groupId) || [];
  return activities.filter(a => new Date(a.timestamp) >= since);
}

// Get groups needing digest
export function getGroupsForDigest(frequency: 'daily' | 'weekly'): Group[] {
  const result: Group[] = [];
  
  groups.forEach(group => {
    if (!group.isArchived && group.settings.digestFrequency === frequency) {
      result.push(group);
    }
  });
  
  return result;
}

// Check and archive expired groups
export function processExpiredGroups(): Group[] {
  const expiredGroups: Group[] = [];
  const now = new Date();
  
  groups.forEach(group => {
    if (!group.isArchived && group.expiresAt && new Date(group.expiresAt) < now) {
      group.isArchived = true;
      groups.set(group.id, group);
      expiredGroups.push(group);
    }
  });
  
  return expiredGroups;
}

// Get groups expiring soon (for notifications)
export function getGroupsExpiringSoon(withinDays: number = 3): Group[] {
  const result: Group[] = [];
  const now = new Date();
  const threshold = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);
  
  groups.forEach(group => {
    if (!group.isArchived && group.expiresAt) {
      const expiresAt = new Date(group.expiresAt);
      if (expiresAt > now && expiresAt <= threshold) {
        result.push(group);
      }
    }
  });
  
  return result;
}

// Extend group expiration
export function extendGroupExpiration(
  groupId: string, 
  userId: string, 
  additionalDays: number
): Group | null {
  const group = getGroup(groupId);
  if (!group) return null;
  
  const member = group.members.find(m => m.userId === userId);
  if (!member || member.role !== 'owner') return null;
  
  if (group.expiresAt) {
    const currentExpiry = new Date(group.expiresAt);
    const newExpiry = new Date(currentExpiry.getTime() + additionalDays * 24 * 60 * 60 * 1000);
    group.expiresAt = newExpiry.toISOString();
  } else {
    group.expiresAt = new Date(Date.now() + additionalDays * 24 * 60 * 60 * 1000).toISOString();
  }
  
  groups.set(groupId, group);
  
  logActivity(groupId, userId, member.name, 'group_updated', 
    `Extended group expiration by ${additionalDays} days`);
  
  return group;
}

// Transfer ownership
export function transferOwnership(
  groupId: string,
  currentOwnerId: string,
  newOwnerId: string
): boolean {
  const group = getGroup(groupId);
  if (!group) return false;
  
  const currentOwner = group.members.find(m => m.userId === currentOwnerId && m.role === 'owner');
  const newOwner = group.members.find(m => m.userId === newOwnerId);
  
  if (!currentOwner || !newOwner) return false;
  
  currentOwner.role = 'admin';
  newOwner.role = 'owner';
  group.ownerId = newOwnerId;
  group.ownerName = newOwner.name;
  
  groups.set(groupId, group);
  
  logActivity(groupId, currentOwnerId, currentOwner.name, 'group_updated',
    `Transferred ownership to ${newOwner.name}`);
  
  return true;
}
