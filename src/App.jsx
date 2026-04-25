import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { CheckCircle, XCircle, Clock, User, CarFront, Phone, Loader2 } from 'lucide-react';
import './index.css';

function App() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'driver_applications'), (snapshot) => {
      const appsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplications(appsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching applications: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const appRef = doc(db, 'driver_applications', id);
      await updateDoc(appRef, { status });
    } catch (error) {
      console.error("Error updating status: ", error);
      alert("حدث خطأ أثناء تحديث الحالة. تأكد من إعدادات Firestore (Rules).");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-warning"><Clock size={16} className="mr-1" /> قيد المراجعة</span>;
      case 'APPROVED':
        return <span className="badge badge-success"><CheckCircle size={16} className="mr-1" /> مقبول</span>;
      case 'REJECTED':
        return <span className="badge badge-error"><XCircle size={16} className="mr-1" /> مرفوض</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="admin-container">
      <header className="header">
        <div className="logo-section">
          <h1>Coursa14 Admin Panel</h1>
          <p>لوحة تحكم مدير التطبيق - إدارة السائقين</p>
        </div>
      </header>

      <main className="main-content">
        <section className="dashboard-header">
          <h2>طلبات السائقين</h2>
          <div className="stats">
            <div className="stat-card">
              <h3>الكل</h3>
              <p>{applications.length}</p>
            </div>
            <div className="stat-card pending">
              <h3>قيد المراجعة</h3>
              <p>{applications.filter(a => a.status === 'PENDING').length}</p>
            </div>
            <div className="stat-card approved">
              <h3>مقبول</h3>
              <p>{applications.filter(a => a.status === 'APPROVED').length}</p>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="loading-state">
            <Loader2 className="spinner" size={48} />
            <p>جاري تحميل البيانات...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <p>لا توجد طلبات تسجيل حتى الآن.</p>
          </div>
        ) : (
          <div className="grid">
            {applications.map(app => (
              <div key={app.id} className="card">
                <div className="card-header">
                  <div className="driver-info-header">
                    <div className="avatar">
                      <User size={24} />
                    </div>
                    <div>
                      <h3>{app.fullName || 'بدون اسم'}</h3>
                      {getStatusBadge(app.status || 'PENDING')}
                    </div>
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="info-row">
                    <Phone size={18} className="icon" />
                    <span>{app.phoneNumber || 'غير متوفر'}</span>
                  </div>
                  <div className="info-row">
                    <CarFront size={18} className="icon" />
                    <span>{app.carType} - {app.carModel} ({app.carColor})</span>
                  </div>
                  <div className="info-row label-plate">
                    <span className="plate-box">{app.licensePlate || 'غير متوفر'}</span>
                  </div>
                  {app.frontIdImageUri && (
                    <div className="attachment">
                      <a href={app.frontIdImageUri} target="_blank" rel="noopener noreferrer">عرض صورة الهوية</a>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button 
                    className="btn btn-success" 
                    disabled={app.status === 'APPROVED'}
                    onClick={() => handleStatusChange(app.id, 'APPROVED')}
                  >
                    <CheckCircle size={18} /> قبول
                  </button>
                  <button 
                    className="btn btn-danger"
                    disabled={app.status === 'REJECTED'}
                    onClick={() => handleStatusChange(app.id, 'REJECTED')}
                  >
                    <XCircle size={18} /> رفض
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
