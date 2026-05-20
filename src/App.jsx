import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import jsPDF from "jspdf";
import './App.css';

const firebaseConfig = {
  apiKey: "AIzaSyB16MWk1eNS4iqw_KVn3NEBkQdsbB3-cpg",
  authDomain: "apdlh-c9a15.firebaseapp.com",
  projectId: "apdlh-c9a15",
  storageBucket: "apdlh-c9a15.firebasestorage.app",
  messagingSenderId: "636727968136",
  appId: "1:636727968136:web:16300d122d2db9cbc27a3d",
  measurementId: "G-Q72FD68W7C"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [people, setPeople] = useState([]);
  const [newPerson, setNewPerson] = useState({name:'', info:'', group:'', image:''});

  useEffect(()=>{
    async function fetchPeople(){
      const snapshot = await getDocs(collection(db, "people"));
      setPeople(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
    }
    fetchPeople();
  }, []);

  const handleLogin = (username, password) => {
    if(username==='admin' && password==='123456') setLoggedIn(true);
    else alert('اسم المستخدم أو كلمة المرور خاطئة');
  };

  const handleAddPerson = async ()=>{
    if(newPerson.name){
      const docRef = await addDoc(collection(db, "people"), newPerson);
      setPeople([...people, {id: docRef.id, ...newPerson}]);
      setNewPerson({name:'', info:'', group:'', image:''});
    }
  };

  const handleDelete = async (id)=>{
    await deleteDoc(doc(db, "people", id));
    setPeople(people.filter(p=>p.id!==id));
  };

  const generatePDF = (person)=>{
    const doc = new jsPDF();
    doc.setFont('Arial');
    doc.text(`الاسم: ${person.name}`,10,20);
    doc.text(`المعلومات: ${person.info}`,10,30);
    doc.text(`المجموعة: ${person.group}`,10,40);
    doc.save(`${person.name}.pdf`);
  };

  if(!loggedIn){
    return (
      <div className="login-container">
        <h1>منصة الأشخاص</h1>
        <LoginForm onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h2>لوحة التحكم</h2>
      <div className="add-person">
        <input placeholder="الاسم" value={newPerson.name} onChange={(e)=>setNewPerson({...newPerson,name:e.target.value})} />
        <input placeholder="المعلومات" value={newPerson.info} onChange={(e)=>setNewPerson({...newPerson,info:e.target.value})} />
        <input placeholder="المجموعة" value={newPerson.group} onChange={(e)=>setNewPerson({...newPerson,group:e.target.value})} />
        <input placeholder="رابط الصورة" value={newPerson.image} onChange={(e)=>setNewPerson({...newPerson,image:e.target.value})} />
        <button onClick={handleAddPerson}>إضافة</button>
      </div>
      <table>
        <thead>
          <tr><th>الصورة</th><th>الاسم</th><th>المعلومات</th><th>المجموعة</th><th>خيارات</th></tr>
        </thead>
        <tbody>
          {people.map((p)=>(
            <tr key={p.id}>
              <td><img src={p.image} alt={p.name} width={50} /></td>
              <td>{p.name}</td>
              <td>{p.info}</td>
              <td>{p.group}</td>
              <td>
                <button onClick={()=>generatePDF(p)}>تحميل PDF</button>
                <button onClick={()=>handleDelete(p.id)}>حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoginForm({onLogin}){
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  return (
    <div>
      <input placeholder="اسم المستخدم" value={username} onChange={(e)=>setUsername(e.target.value)} />
      <input type="password" placeholder="كلمة المرور" value={password} onChange={(e)=>setPassword(e.target.value)} />
      <button onClick={()=>onLogin(username,password)}>تسجيل دخول</button>
    </div>
  );
}

export default App;