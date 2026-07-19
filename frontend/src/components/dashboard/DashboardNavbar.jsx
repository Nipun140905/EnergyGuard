import { createPortal } from 'react-dom'
import { useState } from 'react'

const DashboardNavbar = ({ user, onLogout, onDeleteAccount }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const handleDelete = async () => {
        setDeleting(true)
        try {
            await onDeleteAccount()
        } catch {
            setShowDeleteConfirm(false)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <>
            <nav style={{
                backgroundColor: 'var(--color-bg-alt)',
                borderBottom: '1px solid var(--color-border)',
                padding: '16px 32px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <span style={{
                    fontFamily: 'var(--font-heading)', fontSize: '1.4rem',
                    fontWeight: 700, color: 'var(--color-text)',
                }}>
                    EnergyGuard
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                        {user?.email}
                    </span>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        style={{
                            padding: '6px 16px', fontSize: '0.85rem',
                            border: '1px solid #EF4444', color: '#EF4444',
                            backgroundColor: 'transparent', borderRadius: '4px', cursor: 'pointer',
                        }}
                    >
                        Delete Account
                    </button>
                    <button
                        onClick={onLogout}
                        style={{
                            padding: '6px 16px', fontSize: '0.85rem',
                            border: '1px solid var(--color-border)', color: 'var(--color-muted)',
                            backgroundColor: 'transparent', borderRadius: '4px', cursor: 'pointer',
                        }}
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {showDeleteConfirm && createPortal(
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999,
                }}>
                    <div className="card" style={{ padding: '36px', maxWidth: '400px', width: '90%' }}>
                        <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: '12px' }}>
                            Delete Account
                        </h4>
                        <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>
                            This will permanently delete your account and all analysis data. This cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleting}
                                style={{
                                    flex: 1, padding: '10px',
                                    border: '1px solid var(--color-border)', color: 'var(--color-muted)',
                                    backgroundColor: 'transparent', borderRadius: '4px',
                                    cursor: 'pointer', fontSize: '0.9rem',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                style={{
                                    flex: 1, padding: '10px', border: 'none',
                                    color: '#fff', backgroundColor: '#EF4444',
                                    borderRadius: '4px', cursor: 'pointer',
                                    fontSize: '0.9rem', fontWeight: 600,
                                }}
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}

export default DashboardNavbar