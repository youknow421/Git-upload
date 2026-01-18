import { describe, it, expect } from 'vitest'
import { groupReducer, initialGroupState, GroupState, GroupAction } from './groups'

describe('groupReducer', () => {
  it('should create a new group', () => {
    const action: GroupAction = {
      type: 'CREATE_GROUP',
      payload: { name: 'Family Shopping', description: 'Shared shopping for family' },
    }
    const result = groupReducer(initialGroupState, action)

    expect(result.groups).toHaveLength(1)
    expect(result.groups[0].name).toBe('Family Shopping')
    expect(result.groups[0].members).toHaveLength(1)
    expect(result.groups[0].members[0].role).toBe('owner')
  })

  it('should delete a group', () => {
    const stateWithGroup: GroupState = {
      groups: [
        {
          id: 'group-1',
          name: 'Test Group',
          description: 'Test',
          createdAt: new Date().toISOString(),
          members: [],
          sharedCart: [],
        },
      ],
      activeGroupId: 'group-1',
    }
    const action: GroupAction = { type: 'DELETE_GROUP', payload: 'group-1' }
    const result = groupReducer(stateWithGroup, action)

    expect(result.groups).toHaveLength(0)
    expect(result.activeGroupId).toBeNull()
  })

  it('should set active group', () => {
    const action: GroupAction = { type: 'SET_ACTIVE_GROUP', payload: 'group-1' }
    const result = groupReducer(initialGroupState, action)

    expect(result.activeGroupId).toBe('group-1')
  })

  it('should add member to group', () => {
    const stateWithGroup: GroupState = {
      groups: [
        {
          id: 'group-1',
          name: 'Test Group',
          description: 'Test',
          createdAt: new Date().toISOString(),
          members: [],
          sharedCart: [],
        },
      ],
      activeGroupId: null,
    }
    const action: GroupAction = {
      type: 'ADD_MEMBER',
      payload: {
        groupId: 'group-1',
        member: { id: 'user-2', name: 'Alice', email: 'alice@example.com', role: 'member' },
      },
    }
    const result = groupReducer(stateWithGroup, action)

    expect(result.groups[0].members).toHaveLength(1)
    expect(result.groups[0].members[0].name).toBe('Alice')
  })

  it('should remove member from group', () => {
    const stateWithGroup: GroupState = {
      groups: [
        {
          id: 'group-1',
          name: 'Test Group',
          description: 'Test',
          createdAt: new Date().toISOString(),
          members: [
            { id: 'user-1', name: 'Bob', email: 'bob@example.com', role: 'member', joinedAt: new Date().toISOString() },
          ],
          sharedCart: [],
        },
      ],
      activeGroupId: null,
    }
    const action: GroupAction = {
      type: 'REMOVE_MEMBER',
      payload: { groupId: 'group-1', memberId: 'user-1' },
    }
    const result = groupReducer(stateWithGroup, action)

    expect(result.groups[0].members).toHaveLength(0)
  })

  it('should add item to shared cart', () => {
    const stateWithGroup: GroupState = {
      groups: [
        {
          id: 'group-1',
          name: 'Test Group',
          description: 'Test',
          createdAt: new Date().toISOString(),
          members: [],
          sharedCart: [],
        },
      ],
      activeGroupId: null,
    }
    const action: GroupAction = {
      type: 'ADD_TO_SHARED_CART',
      payload: { groupId: 'group-1', itemId: 'item-1' },
    }
    const result = groupReducer(stateWithGroup, action)

    expect(result.groups[0].sharedCart).toContain('item-1')
  })

  it('should remove item from shared cart', () => {
    const stateWithGroup: GroupState = {
      groups: [
        {
          id: 'group-1',
          name: 'Test Group',
          description: 'Test',
          createdAt: new Date().toISOString(),
          members: [],
          sharedCart: ['item-1', 'item-2'],
        },
      ],
      activeGroupId: null,
    }
    const action: GroupAction = {
      type: 'REMOVE_FROM_SHARED_CART',
      payload: { groupId: 'group-1', itemId: 'item-1' },
    }
    const result = groupReducer(stateWithGroup, action)

    expect(result.groups[0].sharedCart).toHaveLength(1)
    expect(result.groups[0].sharedCart).not.toContain('item-1')
  })
})
