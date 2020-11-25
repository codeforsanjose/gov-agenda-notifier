import React from 'react'
import './AdminView.scss'
import AdminNavigation from './AdminNavigation'
import AgendaTable from '../AgendaTable/AgendaTable'

function AdminView() {
  // const { height, setHeight } = useState('1000px')
  // useEffect(() => {
  //   document.documentElement.scrollHeight =
  // })
  return (
    <div className="admin-view">
      <AdminNavigation />
      <div className="admin-view-content">
        <div className="admin-view-forehead">
          <h3>Agenda for Tuesday, September 1</h3>
        </div>
        <div className="admin-view-header">
          <h3 id="header">Edit Agenda Items</h3>
          <hr></hr>
        </div>
        <AgendaTable />
      </div>
    </div>
  )
}

export default AdminView
