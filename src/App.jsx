import { useState, useEffect } from "react";

export default function App() {
  const [words, setWords] = useState([]); // load from JSON
  const [page, setPage] = useState("home"); // "home" | "quiz" | "review"
  const [mode, setMode] = useState("quiz"); // used for quiz/review distinction
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showEnglish, setShowEnglish] = useState(false);
  const [attemptedWords, setAttemptedWords] = useState([]);
  const [reviewLists, setReviewLists] = useState(() => {
    const savedLists = localStorage.getItem("reviewLists");
    return savedLists ? JSON.parse(savedLists) : [];
  });
  const [newListName, setNewListName] = useState("");
  const [showSaveList, setShowSaveList] = useState(false);
  const [currentReviewWords, setCurrentReviewWords] = useState([]);

  // --- Load JSON A1 words ---
  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "data/german-a1-nouns.json")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load JSON");
        return res.json();
      })
      .then(data => setWords(data))
      .catch(err => {
        console.error(err);
        alert("Failed to load word list");
      });
  }, []);

  function startQuiz() {
    setPage("quiz");
    setMode("quiz");
    setIndex(0);
    setAttemptedWords([]);
    setSelected(null);
    setShowEnglish(false);
  }

  function startReview(list) {
    setPage("review");
    setMode("review");
    setCurrentReviewWords(list.words);
    setIndex(0);
    setAttemptedWords([]);
    setSelected(null);
    setShowEnglish(false);
  }

  function backToHome() {
    setPage("home");
    setIndex(0);
    setAttemptedWords([]);
    setSelected(null);
    setShowEnglish(false);
  }

  function deleteReviewList(indexToDelete) {
    const updatedLists = reviewLists.filter((_, i) => i !== indexToDelete);
    setReviewLists(updatedLists);
    localStorage.setItem("reviewLists", JSON.stringify(updatedLists));
  }

  function currentWord() {
    return mode === "quiz" ? words[index] : currentReviewWords[index];
  }

  function chooseArticle(article) {
    if (selected) return;
    setSelected(article);
    setAttemptedWords(prev => [...prev, { ...currentWord(), selected: article, addToList: false }]);
  }

  function nextWord() {
    setSelected(null);
    setShowEnglish(false);
    setIndex(prev => prev + 1);
  }

  function toggleWordForList(wordId) {
    setAttemptedWords(prev => prev.map(w => w.id === wordId ? { ...w, addToList: !w.addToList } : w));
  }

  function saveReviewList() {
    if (!newListName) return;
    const wordsToSave = attemptedWords.filter(w => w.addToList);
    if (wordsToSave.length === 0) return;

    const updatedLists = [...reviewLists, { name: newListName, words: wordsToSave }];
    setReviewLists(updatedLists);
    localStorage.setItem("reviewLists", JSON.stringify(updatedLists));
    setShowSaveList(false);
    setNewListName("");
  }

  if (words.length === 0) {
    return <p style={{ textAlign: 'center', marginTop: 50 }}>Loading words...</p>;
  }

  // --- Home Page ---
  if (page === "home") {
    return (
      <div style={styles.outerContainer}>
        <div style={styles.container}>
          <h1>German A1 Trainer</h1>
          <button onClick={startQuiz} style={{ ...styles.button, marginBottom: 20 }}>Start A1 Quiz</button>

          {reviewLists.length > 0 && (
            <div style={{ marginTop: 30, width: '100%' }}>
              <h3>My Review Lists</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {reviewLists.map((list, i) => (
                  <li key={i} style={{ marginBottom: 8, display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
                    <span>{list.name} ({list.words.length} words)</span>
                    <button onClick={() => startReview(list)}>Start Review</button>
                    <button onClick={() => deleteReviewList(i)} style={{ color: 'red' }}>Delete</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Quiz or Review Mode Finished ---
  const word = currentWord();
  if ((mode === "quiz" && index >= words.length) || (mode === "review" && index >= currentReviewWords.length)) {
    return (
      <div style={styles.outerContainer}>
        <div style={styles.container}>
          <h2>{mode === "quiz" ? "Quiz Finished" : "Review Finished"}</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {attemptedWords.map(w => (
              <li key={w.id} style={{ marginBottom: 8, textAlign: 'center' }}>
                <input type="checkbox" checked={w.addToList || false} onChange={() => toggleWordForList(w.id)} style={{ marginRight: 8 }} />
                {w.noun} ({w.selected}) {w.selected === w.article ? '✓' : '✗'}
              </li>
            ))}
          </ul>

          {!showSaveList ? (
            <button onClick={() => setShowSaveList(true)}>Save Selected Words to Review List</button>
          ) : (
            <div>
              <input type="text" placeholder="Enter review list name" value={newListName} onChange={e => setNewListName(e.target.value)} style={{ padding: 6, marginRight: 8 }} />
              <button onClick={saveReviewList}>Save</button>
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <button onClick={backToHome}>Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  // --- Quiz / Review Mode ---
  return (
    <div style={styles.outerContainer}>
      <div style={styles.container}>
        <h2>{mode === "quiz" ? "A1 Quiz" : "Review Mode"}</h2>
        <h1>{word.noun}</h1>
        <div style={styles.buttons}>
          {['der','die','das'].map(a => (
            <button key={a} onClick={() => chooseArticle(a)} style={{ ...styles.button, background: selected === a ? (a === word.article ? '#4caf50' : '#f44336') : '#eee' }}>{a}</button>
          ))}
        </div>

        {selected && (
          <>
            <p>Correct article: <strong>{word.article}</strong></p>
            {!showEnglish ? (
              <button onClick={() => setShowEnglish(true)}>Show English + Plural</button>
            ) : (
              <p>English: {word.english} | Plural: {word.plural}</p>
            )}
            <button onClick={nextWord} style={{ marginTop: 16 }}>Next</button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  outerContainer: {
    display: 'flex', justifyContent: 'center', width: '100%', minHeight: '100vh', boxSizing: 'border-box', padding: '0 16px', backgroundColor: '#f9f9f9'
  },
  container: {
    fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', marginTop: 40, width: '100%', maxWidth: '100%', boxSizing: 'border-box'
  },
  buttons: { display: 'flex', justifyContent: 'center', gap: 12 },
  button: { padding: '10px 16px', fontSize: 16, cursor: 'pointer' }
};