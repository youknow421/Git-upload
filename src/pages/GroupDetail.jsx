import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGroups, useCart } from '../context/CartContext'

export default function GroupDetail() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const { groups, addMember, removeMember, updateMemberRole, updateGroup } = useGroups()
  const { itemsArray } = useCart()
  
  const group = groups.find((g) => g.id === groupId)
  
  const [showAddMember, setShowAddMember] = useState(false)
  const [memberName, setMemberName] = useState('')
  const [memberEmail, setMemberEmail] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')

  if (!group) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h2>Group not found</h2>
        <Link to="/groups" className="btn">
          Back to Groups
        </Link>
      </div>
    )
  }

  const handleAddMember = () => {
    if (memberName.trim() && memberEmail.trim()) {
      addMember(group.id, {
        id: Math.random().toString(36).substring(2, 11),
        name: memberName,
        email: memberEmail,
        role: 'member',
      })
      setMemberName('')
      setMemberEmail('')
      setShowAddMember(false)
    }
  }

  const handleUpdate = () => {
    if (editName.trim()) {
      updateGroup(group.id, { name: editName, description: editDesc })
      setIsEditing(false)
    }
  }

  const startEdit = () => {
    setEditName(group.name)
    setEditDesc(group.description)
    setIsEditing(true)
  }

  const sharedCartItems = itemsArray.filter((item) => group.sharedCart.includes(item.product.id))

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/groups" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px' }}>
          ← Back to Groups
        </Link>
      </div>

      {isEditing ? (
        <div
          style={{
            padding: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #e5e7eb',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Edit Group</h3>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Group Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
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
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
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
            <button onClick={handleUpdate} className="btn btn-primary">
              Save
            </button>
            <button onClick={() => setIsEditing(false)} className="btn">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ margin: '0 0 8px' }}>{group.name}</h1>
              <p style={{ margin: '0 0 12px', color: '#6b7280' }}>{group.description}</p>
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                Created on {new Date(group.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button onClick={startEdit} className="btn">
              Edit Group
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '18px' }}>Members ({group.members.length})</h2>
            <button onClick={() => setShowAddMember(!showAddMember)} className="btn btn-primary">
              + Add Member
            </button>
          </div>

          {showAddMember && (
            <div
              style={{
                padding: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '8px',
                marginBottom: '16px',
                border: '1px solid #e5e7eb',
              }}
            >
              <div style={{ marginBottom: '8px' }}>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="Name"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="Email"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleAddMember} className="btn btn-primary" style={{ fontSize: '14px' }}>
                  Add
                </button>
                <button onClick={() => setShowAddMember(false)} className="btn" style={{ fontSize: '14px' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {group.members.map((member) => (
              <div
                key={member.id}
                style={{
                  padding: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{member.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{member.email}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span
                    style={{
                      padding: '4px 8px',
                      backgroundColor: member.role === 'owner' ? '#3b82f6' : '#e5e7eb',
                      color: member.role === 'owner' ? 'white' : '#374151',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    {member.role}
                  </span>
                  {member.role !== 'owner' && (
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${member.name}?`)) {
                          removeMember(group.id, member.id)
                        }
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ margin: '0 0 12px', fontSize: '18px' }}>Shared Cart ({sharedCartItems.length})</h2>
          {sharedCartItems.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '14px' }}>No items in shared cart yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sharedCartItems.map((item) => (
                <div
                  key={item.product.id}
                  style={{
                    padding: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{item.product.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    ${item.product.price.toFixed(2)} × {item.qty} = ${(item.product.price * item.qty).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
