import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGroups } from '../context/CartContext'

export default function Groups() {
  const { groups, createGroup, deleteGroup, setActiveGroup, activeGroup } = useGroups()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')

  const handleCreate = () => {
    if (newGroupName.trim()) {
      createGroup(newGroupName, newGroupDesc)
      setNewGroupName('')
      setNewGroupDesc('')
      setShowCreateForm(false)
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>My Groups</h1>
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn btn-primary">
          + Create Group
        </button>
      </div>

      {showCreateForm && (
        <div
          style={{
            padding: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #e5e7eb',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Create New Group</h3>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Group Name</label>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Family Shopping"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '16px',
              }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Description</label>
            <textarea
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
              placeholder="Shared shopping for family members"
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '16px',
                fontFamily: 'inherit',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleCreate} className="btn btn-primary">
              Create
            </button>
            <button onClick={() => setShowCreateForm(false)} className="btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      {groups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ color: '#6b7280' }}>You haven't created any groups yet.</p>
          <p style={{ fontSize: '14px', color: '#9ca3af' }}>
            Groups allow you to share carts with friends and family!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {groups.map((group) => (
            <div
              key={group.id}
              style={{
                padding: '20px',
                backgroundColor: activeGroup?.id === group.id ? 'rgba(37, 99, 235, 0.1)' : 'rgba(255, 255, 255, 0.8)',
                borderRadius: '10px',
                border: `2px solid ${activeGroup?.id === group.id ? '#3b82f6' : '#e5e7eb'}`,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>{group.name}</h3>
                  <p style={{ margin: '0 0 12px', color: '#6b7280', fontSize: '14px' }}>{group.description}</p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                    <span>👥 {group.members.length} member{group.members.length !== 1 ? 's' : ''}</span>
                    <span>🛒 {group.sharedCart.length} item{group.sharedCart.length !== 1 ? 's' : ''}</span>
                    <span style={{ fontSize: '12px' }}>
                      Created {new Date(group.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link to={`/groups/${group.id}`} className="btn">
                    View Details
                  </Link>
                  {activeGroup?.id === group.id ? (
                    <button onClick={() => setActiveGroup(null)} className="btn">
                      Deactivate
                    </button>
                  ) : (
                    <button onClick={() => setActiveGroup(group.id)} className="btn btn-primary">
                      Set Active
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${group.name}"?`)) {
                        deleteGroup(group.id)
                      }
                    }}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeGroup && (
        <div
          style={{
            marginTop: '20px',
            padding: '16px',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderRadius: '8px',
            border: '1px solid #3b82f6',
          }}
        >
          <p style={{ margin: 0, fontSize: '14px' }}>
            ✓ <strong>{activeGroup.name}</strong> is currently active. Items you add to your cart will be shared with
            this group.
          </p>
        </div>
      )}
    </div>
  )
}
