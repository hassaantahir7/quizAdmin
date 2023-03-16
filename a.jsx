import React , {useState,useEffect} from 'react';
import swal from 'sweetalert';
import './Addquestion.css'
import AppLayout from '../components/layout/AppLayout';
import AdminDataService from '../services/AdminServices';
import { db } from '../Firebase';
import { useCollectionData } from "react-firebase-hooks/firestore";
import { 
  collection,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
  getDocs,
} from "firebase/firestore"; 

  
  const styles = {
    tabs: {
      display: 'flex',
    },
    tab: {
      flex: 1,
      cursor: 'pointer',
      textAlign: 'center',
      border: '1px solid #ccc',
      borderBottom: 'none',
      padding: '0.5rem',
    },
    tabContent: {
      border: '1px solid #ccc',
      padding: '0.5rem',
    },
  };
  
  const Tab = ({ tabs, activeTab, onClick }) => {
    return (
      <div className="tabs" style={styles.tabs}>
        {tabs.map(tab => (
          <div
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => onClick(tab)}
          >
            {tab}
          </div>
        ))}
      </div>
    );
  };
  

const Questions = () => {
    const [activeTab, setActiveTab] = useState('All Questions');
    const tabs = ['All Questions', 'Add Questions'];

    const [docId, setDocId] = useState('');
    const [levelId, setLevelId] = useState('');
    const [Question, setQuestion] = useState('');
    const [Option1, setOption1] = useState('');
    const [Option2, setOption2] = useState('');
    const [Option3, setOption3] = useState('');
    const [Option4, setOption4] = useState('');
    const [Answer, setAnswer] = useState('');
    const [questionCollectionName, setQuestionCollectionName] = useState('Questions');
    const [questionCollectionDocName, setQuestionCollectionDocName] = useState('');
    const [questionId, setQuestionId] = useState('');
    const [message, setMessage] = useState('');
  

  
  const [categories, setCategories]=useState([]);
  const [levels, setLevels]=useState([]);
  const [questions, setQuestions]=useState([]);
  
  useEffect(() =>{
    getCategories();
  }, []);
  const getCategories = async() =>{
    const data = await AdminDataService.getAllCategories();
    // console.log(data.docs);
    setCategories(data.docs.map((doc)=>({...doc.data(),id:doc.id})))
  }    
    
  useEffect(() =>{
    getLevels(docId);
  }, [docId]);
  const getLevels = async() =>{
    const querySnapshot = await getDocs(collection(db, "QuizCategory", docId,"Levels"));
    const levels = querySnapshot.docs.map(doc=>({
      id: doc.id, name: doc.data().name
    }));
    querySnapshot.forEach((doc) => {
      // console.log(doc.id, " => ", doc.data());
      setLevels(levels);
    });
  }    

  useEffect(() =>{
    getQuestions(levelId);
  }, [levelId]);
  const getQuestions = async() =>{
    const querySnapshot = await getDocs(collection(db, "QuizCategory", docId,"Levels",levelId,questionCollectionName));
    const questions = querySnapshot.docs.map(doc=>({
      id: doc.id,
      Question: doc.data().Question,
      Option1:doc.data().Option1,
      Option2:doc.data().Option2,
      Option3:doc.data().Option3,
      Option4:doc.data().Option4,
      Answer:doc.data().Answer

    }));
    querySnapshot.forEach((doc) => {
      setQuestions(questions);
      // console.log(doc.id, " => ", doc.data());
    });   
  }

  const query = collection(db, "QuizCategory");
  const [docs, loading, error] = useCollectionData(query);

  /* ---------- Adding new Collection -------------- */
  const handleSubmit = async (e) =>{
    e.preventDefault();
      const newQuizLevelCollection = {
      Answer,
      Option1,
      Option2,
      Option3,
      Option4,
      Question
    };
      
    try
    {
      const collectionRef = collection(db,"QuizCategory", docId, "Levels",levelId,questionCollectionName);
      await setDoc(doc(collectionRef,questionCollectionDocName), newQuizLevelCollection)
      .then(() =>{
        swal("Success!", "Document added successfully!", "success");
      })
    }
    catch(err) 
    {
      setMessage({error: true,msg:err.message});
      swal("Error!", message, "error");
    }
  }

  /* ----------------------------- Delete Question ----------------------------- * */
  const deleteQuestion = (id) =>{
    const questionDoc = doc(db, "QuizCategory", docId,"Levels",levelId,questionCollectionName, id);
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
         deleteDoc(questionDoc);
        swal("Poof! Your level has been deleted!", {
          icon: "success",
        });
      } else {
        swal("Your level is safe!");
      }
    });
  };
  
    const deleteHandler = async (id) => {
      await deleteQuestion(id)
      .then(() =>{
        swal("Success!", "Document deleted successfully!", "success");
      })
    };

    /* ------------------------- Update Question ------------------------- */
    const getQuestion = (id) =>{
      const questionDoc = doc(db , "QuizCategory", docId, "Levels",levelId,questionCollectionName, id);
      return getDoc(questionDoc);
  };
    const questionHandler = (questionId) =>{
      setQuestionId(questionId);
    };
    
    const questionEditHandler = async () =>{
      setMessage("");
      try
      {
        const docSnap = await getQuestion(questionId);
        console.log("The record is: ",docSnap.data());
        setAnswer(docSnap.data().Answer);
        setQuestion(docSnap.data().question);
        setOption1(docSnap.data().Option1);
        setOption2(docSnap.data().Option2);
        setOption3(docSnap.data().Option3);
        setOption4(docSnap.data().Option4);
        setQuestionCollectionDocName(docSnap.id);
      }
      catch(err)
      {
        setMessage({error: true,msg:err.message});
        swal("Error!", message, "error");
      }
      swal("Success!", "Document edited successfully!", "success");
    }
    useEffect(() =>{
      if(questionId !== undefined && questionId!=="")
     questionEditHandler();
    }, [questionId])

    return (
      <>
        <AppLayout />
      <div className='questions' >
           <Tab tabs={tabs} activeTab={activeTab} onClick={setActiveTab} />
        <div className="tab-content">
          {activeTab === 'All Questions' &&
           <div className='all-questions-container'>
            <label>
                      Select Category:
                      <select value={docId} onChange={e => setDocId(e.target.value)} >
                        <option value="" disabled>Select a Document</option>
                        {categories?.map(doc => (
                          <option key={doc.id} value={doc.id}>
                            {doc.id}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label id='label-2'>
                      Select Level:
                      <select value={levelId} onChange={e => setLevelId(e.target.value)} >
                        {levels.length === 0 && 
                        <option value="" disabled>
                          No quizzes found in this category
                          </option>}
                        <option value="" disabled>Select a Document</option>
                        {levels?.map(levels => (
                          <option key={levels.id} value={levels.id}>
                            {levels.id}
                          </option>
                        ))}
                      </select>
                    </label>

                    <table class="GeneratedTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Questions Name</th>
                <th>Question Statement</th>
                <th>Option1</th>
                <th>Option2</th>
                <th>Option3</th>
                <th>Option4</th>
                <th>Answer</th>
                <th>Edit/Delete</th>
              </tr>
            </thead>
            <tbody>
              {questions?.map((question,index) =>{
                return (
                  
                  <tr key={question.id}>
                    <td>{index +1}</td>
                    <td>{question.id} </td>
                    <td>{question.Question}</td>
                    <td>{question.Option1}</td>
                    <td>{question.Option2}</td>
                    <td>{question.Option3}</td>
                    <td>{question.Option4}</td>
                    <td>{question.Answer}</td>
                    <td>
                      <button
                        id='edit-button' 
                        onClick={(e) => questionHandler(question.id)}>
                        Edit
                      </button>
                      <button
                        id='delete-button' 
                        onClick={(e) => deleteHandler(doc.id)} >
                          Delete
                      </button>
                    </td>
              </tr>
                )
              })}
            </tbody>
          </table>

            </div>}
  
            {/* ------------------------------------------------------------* */}
            {/* ------------------------------------------------------------* */}
          {activeTab === 'Add Questions' && 
          <div className='add-questions-container' >
            <h1 className='add-questions-heading'>Add Questions</h1>
              <div className='add-question-form'>
                
              <form onSubmit={handleSubmit} className='prod-form-add-question'>
                <div className="add-top">
                <div className="form-group">
                <label>
                      Select Category:
                      <select value={docId} onChange={e => setDocId(e.target.value)} >
                        <option value="" disabled>Select a Document</option>
                        {categories?.map(doc => (
                          <option key={doc.id} value={doc.id}>
                            {doc.id}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
  
                  <div  className="form-group">
                  <label >
                      Select Level:
                      <select value={levelId} onChange={e => setLevelId(e.target.value)} >
                        {levels.length === 0 && 
                        <option value="" disabled>
                          No quizzes found in this category
                          </option>}
                        <option value="" disabled>Select a Document</option>
                        {levels?.map(levels => (
                          <option key={levels.id} value={levels.id}>
                            {levels.id}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>    
                  <div className="form-group">
                    <label htmlFor="cat">Question Name</label>
                    <input required type="text" value={questionCollectionDocName}
                    onChange={e => setQuestionCollectionDocName(e.target.value)} />
                </div>       
                  </div>
  
  {/* ------------------------------------------------------------ */}
                   
                  <div className="add-quest">
                  <div className="form-group-add-q">
                      <label htmlFor="cat"
                      
                      >
                        Question Statement</label>
                      <textarea required type="text" id='ques-stat'
                      value={Question}
                      onChange={e=>setQuestion(e.target.value)}
                      />
                  </div>
                  
                  </div>
  
                  {/* -------------------------------------------------------*/}
  
                  <div className="add-top">
                <div className="form-group-opt">
                      <label htmlFor="cat"
                    
                      >Answer 1</label>
                      <input required type="text"
                        value={Option1}
                        onChange={e=>setOption1(e.target.value)}
                         />
                  </div>
  
                  <div className="form-group-opt">
                      <label htmlFor="cat"
                      
                      >Answer 2</label>
                      <input required type="text" 
                      value={Option2}
                      onChange={e=>setOption2(e.target.value)}
                       />
                  </div>  

                  <div className="form-group-opt">
                      <label htmlFor="cat"
                     
                      >Answer 3</label>
                      <input required type="text" 
                       value={Option3}
                       onChange={e=>setOption3(e.target.value)} />
                  </div> 

                  <div className="form-group-opt">
                      <label htmlFor="cat"
                     >Answer 4</label>

                      <input required type="text"
                       value={Option4}
                       onChange={e=>setOption4(e.target.value)}
                        />

                  </div> 

                  <div className="form-group-opt">
                      <label htmlFor="cat"
                      
                      >Correct Answer</label>
                      <input required type="text" 
                      value={Answer}
                      onChange={e=>setAnswer(e.target.value)}/>
                  </div>          
                  </div>

                  <div className='buttonClass'>

                  <button id='questionButton' value="submit">Add Question</button>
                  </div>

                </form>
              </div>
  
            </div>}
        </div>
      </div>
      </>
    )
};

export default Questions;
