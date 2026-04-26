import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { CheckCircle, XCircle, Clock, User, CarFront, Phone, Loader2 } from 'lucide-react';
import './index.css';

function App() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleStatusChange = async (app, status) => {
    try {
      const appRef = doc(db, 'driver_applications', app.id);
      await updateDoc(appRef, { status });
      
      // Update the user document to make them an active driver
      if (status === 'approved' && app.uid) {
        const userRef = doc(db, 'users', app.uid);
        await updateDoc(userRef, { status: 'approved', role: 'driver' });
      }
    } catch (error) {
      console.error("Error updating status: ", error);
      alert("حدث خطأ أثناء تحديث الحالة. تأكد من إعدادات Firestore (Rules).");
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <span className="badge badge-warning"><Clock size={16} className="mr-1" /> قيد المراجعة</span>;
      case 'approved':
        return <span className="badge badge-success"><CheckCircle size={16} className="mr-1" /> مقبول</span>;
      case 'rejected':
        return <span className="badge badge-error"><XCircle size={16} className="mr-1" /> مرفوض</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const filteredApps = applications.filter(app => {
    const term = searchTerm.toLowerCase();
    return (app.fullName?.toLowerCase().includes(term)) ||
           (app.phoneNumber?.includes(term)) ||
           (app.licensePlate?.toLowerCase().includes(term));
  });

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
              <p>{applications.filter(a => a.status?.toLowerCase() === 'pending').length}</p>
            </div>
            <div className="stat-card approved">
              <h3>مقبول</h3>
              <p>{applications.filter(a => a.status?.toLowerCase() === 'approved').length}</p>
            </div>
          </div>
          
          <div className="search-bar" style={{ marginTop: '20px' }}>
            <input 
              type="text" 
              placeholder="ابحث بالاسم، رقم الهاتف، أو رقم اللوحة..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }}
            />
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
            {filteredApps.map(app => (
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
                  <div className="documents">
                    {app.licenseImageUrl && <a href={app.licenseImageUrl} target="_blank" rel="noreferrer" className="doc-link">رخصة السياقة</a>}
                    {app.idImageUrl && <a href={app.idImageUrl} target="_blank" rel="noreferrer" className="doc-link">بطاقة الهوية</a>}
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    className="btn btn-success" 
                    disabled={app.status?.toLowerCase() === 'approved'}
                    onClick={() => handleStatusChange(app, 'approved')}
                  >
                    <CheckCircle size={18} /> قبول
                  </button>
                  <button 
                    className="btn btn-danger"
                    disabled={app.status?.toLowerCase() === 'rejected'}
                    onClick={() => handleStatusChange(app, 'rejected')}
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
