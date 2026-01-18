import { Router, Request, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth.js';
import { 
  createGroup, 
  getGroup, 
  getUserGroups, 
  updateGroup as updateGroupData,
  deleteGroup,
  createInvite,
  getInviteByToken,
  getPendingInvitesForEmail,
  acceptInvite,
  declineInvite,
  cancelInvite,
  removeMember,
  updateMemberRole,
  addToSharedCart,
  removeFromSharedCart,
  getGroupActivity,
  extendGroupExpiration,
  transferOwnership,
  Group
} from '../groups.js';
import { sendGroupInviteEmail, sendGroupDigestEmail } from '../email.js';
import { createNotification } from '../notifications.js';

const router = Router();

// Apply auth middleware to all routes
router.use(requireAuth);

//ROUTES THAT DON'T USE :id PARAM FIRST

router.get('/invites/pending', (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const pendingInvites = getPendingInvitesForEmail(user.email);
    res.json(pendingInvites.map(({ invite, group }) => ({
      invite,
      groupName: group.name,
      groupDescription: group.description,
      memberCount: group.members.length
    })));
  } catch (error) {
    console.error('Error fetching pending invites:', error);
    res.status(500).json({ error: 'Failed to fetch pending invites' });
  }
});

router.get('/invite/:token', (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const result = getInviteByToken(token);

    if (!result) {
      return res.status(404).json({ error: 'Invite not found or expired' });
    }

    const { invite, group } = result;
    res.json({
      inviterName: invite.inviterName,
      groupName: group.name,
      groupDescription: group.description,
      memberCount: group.members.length,
      expiresAt: invite.expiresAt
    });
  } catch (error) {
    console.error('Error fetching invite:', error);
    res.status(500).json({ error: 'Failed to fetch invite' });
  }
});

//Invit
router.post('/invite/:token/accept', (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { token } = req.params;
    const group = acceptInvite(token, user.id, user.name, user.email);

    if (!group) {
      return res.status(400).json({ error: 'Failed to accept invite. It may have expired or email does not match.' });
    }

    // Notify group owner
    const owner = group.members.find(m => m.role === 'owner');
    if (owner) {
      createNotification(
        owner.userId,
        'group_update',
        'New Member Joined',
        `${user.name} has joined your group "${group.name}"`,
        { groupId: group.id }
      );
    }

    res.json(group);
  } catch (error) {
    console.error('Error accepting invite:', error);
    res.status(500).json({ error: 'Failed to accept invite' });
  }
});

// Decline invite
router.post('/invite/:token/decline', (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { token } = req.params;
    const success = declineInvite(token, user.email);

    if (!success) {
      return res.status(400).json({ error: 'Failed to decline invite' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error declining invite:', error);
    res.status(500).json({ error: 'Failed to decline invite' });
  }
});

//MAIN ROUTE

// Get all groups for current user
router.get('/', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const groups = getUserGroups(userId);
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Get single group
router.get('/:id', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const groupId = req.params.id;

    const group = getGroup(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is a member
    if (!group.members.some(m => m.userId === userId)) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    res.json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// Create group
router.post('/', (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, description, expiresInDays } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const group = createGroup(
      user.id,
      user.name,
      user.email,
      name,
      description || '',
      expiresInDays
    );

    res.status(201).json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Update group
router.put('/:id', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const groupId = req.params.id;
    const updates = req.body;

    const group = updateGroupData(groupId, userId, updates);
    if (!group) {
      return res.status(404).json({ error: 'Group not found or insufficient permissions' });
    }

    res.json(group);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// Delete group
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const groupId = req.params.id;

    const success = deleteGroup(groupId, userId);
    if (!success) {
      return res.status(404).json({ error: 'Group not found or insufficient permissions' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// Get group activity
router.get('/:id/activity', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const groupId = req.params.id;
    const limit = parseInt(req.query.limit as string) || 20;

    const group = getGroup(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (!group.members.some(m => m.userId === userId)) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    const activity = getGroupActivity(groupId, limit);
    res.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

//INVITES

// Send invite
router.post('/:id/invites', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const groupId = req.params.id;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const group = getGroup(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const invite = createInvite(groupId, user.id, user.name, email);
    if (!invite) {
      return res.status(400).json({ error: 'Failed to create invite. User may already be a member.' });
    }

    // Send invite email
    await sendGroupInviteEmail(
      email,
      user.name,
      group.name,
      invite.token
    );

    res.status(201).json(invite);
  } catch (error) {
    console.error('Error sending invite:', error);
    res.status(500).json({ error: 'Failed to send invite' });
  }
});

// Get pending invites for group
router.get('/:id/invites', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const groupId = req.params.id;

    const group = getGroup(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check permissions
    const member = group.members.find(m => m.userId === userId);
    if (!member || member.role === 'member') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const pendingInvites = group.invites.filter(i => i.status === 'pending');
    res.json(pendingInvites);
  } catch (error) {
    console.error('Error fetching invites:', error);
    res.status(500).json({ error: 'Failed to fetch invites' });
  }
});

// Cancel invite
router.delete('/:id/invites/:inviteId', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id: groupId, inviteId } = req.params;

    const success = cancelInvite(groupId, inviteId, userId);
    if (!success) {
      return res.status(404).json({ error: 'Invite not found or insufficient permissions' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error cancelling invite:', error);
    res.status(500).json({ error: 'Failed to cancel invite' });
  }
});

// MEMBERS

// Remove member
router.delete('/:id/members/:memberId', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id: groupId, memberId } = req.params;

    const group = getGroup(groupId);
    const memberToRemove = group?.members.find(m => m.id === memberId);

    const success = removeMember(groupId, memberId, userId);
    if (!success) {
      return res.status(400).json({ error: 'Failed to remove member' });
    }

    // Notify removed member if not self-removal
    if (memberToRemove && memberToRemove.userId !== userId && group) {
      createNotification(
        memberToRemove.userId,
        'group_update',
        'Removed from Group',
        `You have been removed from the group "${group.name}"`,
        {}
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Update member role
router.put('/:id/members/:memberId/role', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id: groupId, memberId } = req.params;
    const { role } = req.body;

    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const success = updateMemberRole(groupId, memberId, role, userId);
    if (!success) {
      return res.status(400).json({ error: 'Failed to update role' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Transfer ownership
router.post('/:id/transfer-ownership', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const groupId = req.params.id;
    const { newOwnerId } = req.body;

    const group = getGroup(groupId);
    const newOwner = group?.members.find(m => m.userId === newOwnerId);

    const success = transferOwnership(groupId, userId, newOwnerId);
    if (!success) {
      return res.status(400).json({ error: 'Failed to transfer ownership' });
    }

    // Notify new owner
    if (newOwner && group) {
      createNotification(
        newOwnerId,
        'group_update',
        'You are now the owner',
        `You are now the owner of the group "${group.name}"`,
        { groupId }
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error transferring ownership:', error);
    res.status(500).json({ error: 'Failed to transfer ownership' });
  }
});

//SHARED CART

// Add to shared cart
router.post('/:id/cart', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const groupId = req.params.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const success = addToSharedCart(groupId, productId, userId);
    if (!success) {
      return res.status(400).json({ error: 'Failed to add to cart' });
    }

    const group = getGroup(groupId);
    res.json(group?.sharedCart || []);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Remove from shared cart
router.delete('/:id/cart/:productId', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id: groupId, productId } = req.params;

    const success = removeFromSharedCart(groupId, productId, userId);
    if (!success) {
      return res.status(400).json({ error: 'Failed to remove from cart' });
    }

    const group = getGroup(groupId);
    res.json(group?.sharedCart || []);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

//EXPIRATION

// Extend group expiration
router.post('/:id/extend', (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const groupId = req.params.id;
    const { days } = req.body;

    if (!days || days < 1) {
      return res.status(400).json({ error: 'Days must be at least 1' });
    }

    const group = extendGroupExpiration(groupId, userId, days);
    if (!group) {
      return res.status(400).json({ error: 'Failed to extend expiration' });
    }

    res.json(group);
  } catch (error) {
    console.error('Error extending expiration:', error);
    res.status(500).json({ error: 'Failed to extend expiration' });
  }
});

export default router;
