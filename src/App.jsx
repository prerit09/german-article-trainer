import { useState, useEffect } from "react";

export default function App() {
  const [words, setWords] = useState([]);
  const [page, setPage] = useState("home"); // home | quiz | review
  const [mode, setMode] = useState("quiz");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showEnglish, setShowEnglish] = useState(false);
  const [attemptedWords, setAttemptedWords] = useState([]);
  const [reviewLists, setReviewLists] = useState(() => {
    const saved = localStorage.getItem("reviewLists");
    return saved ? JSON.parse(saved) : [];
  });
  const [newListName, setNewListName] = useState("");
  const [showSaveList, setShowSaveList] = useState(false);
  const [currentReviewWords, setCurrentReviewWords] = useState([]);

  // Load JSON words
  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "data/german-a1-nouns.json")
      .then(res => res.json())
      .then(setWords)
      .catch(err => console.error("Failed to load words", err));
  }, []);

  if (words.length === 0) {
    return <p style={{ textAlign: "center" }}>Loading words…</p>;
  }

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
    setSelected(null);
    setShowEnglish(false);
  }

  function deleteReviewList(i) {
    const updated = reviewLists.filter((_, idx) => idx !== i);
    setReviewLists(updated);
    localStorage.setItem("reviewLists", JSON.stringify(updated));
  }

  function currentWord() {
    return mode === "quiz" ? words[index] : currentReviewWords[index];
  }

  function chooseArticle(article) {
    if (selected) return;
    setSelected(article);
    setAttemptedWords(prev => [
      ...prev,
      { ...currentWord(), selected: article, addToList: false }
    ]);
  }

  function nextWord() {
    setSelected(null);
    setShowEnglish(false);
    setIndex(i => i + 1);
  }

  function toggleWordForList(id) {
    setAttemptedWords(prev =>
      prev.map(w => (w.id === id ? { ...w, addToList: !w.addToList } : w))
    );
  }

  function selectAllIncorrect() {
    setAttemptedWords(prev =>
      prev.map(w =>
        w.selected !== w.article ? { ...w, addToList: true } : w
      )
    );
  }

  function selectAllCorrect() {
    setAttemptedWords(prev =>
      prev.map(w =>
        w.selected === w.article ? { ...w, addToList: true } : w
      )
    );
  }

  function clearSelection() {
    setAttemptedWords(prev => prev.map(w => ({ ...w, addToList: false })));
  }

  function saveReviewList() {
    if (!newListName) return;
    const selectedWords = attemptedWords.filter(w => w.addToList);
    if (selectedWords.length === 0) return;

    const updated = [...reviewLists, { name: newListName, words: selectedWords }];
    setReviewLists(updated);
    localStorage.setItem("reviewLists", JSON.stringify(updated));
    setShowSaveList(false);
    setNewListName("");
  }

  // HOME
  if (page === "home") {
    return (
      <div style={styles.outer}>
        <div style={styles.container}>
          <h1>German A1 Trainer</h1>
          <button onClick={startQuiz}>Start Quiz</button>

          {reviewLists.length > 0 && (
            <div style={{ marginTop: 30 }}>
              <h3>My Review Lists</h3>
              {reviewLists.map((list, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <span>{list.name} ({list.words.length}) </span>
                  <button onClick={() => startReview(list)}>Review</button>
                  <button onClick={() => deleteReviewList(i)} style={{ color: "red" }}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const word = currentWord();

  // FINISHED
  if ((mode === "quiz" && index >= words.length) ||
      (mode === "review" && index >= currentReviewWords.length)) {
    return (
      <div style={styles.outer}>
        <div style={styles.container}>
          <h2>Finished</h2>

          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button onClick={selectAllIncorrect}>Select Incorrect</button>
            <button onClick={selectAllCorrect}>Select Correct</button>
            <button onClick={clearSelection}>Clear</button>
          </div>

          {attemptedWords.map(w => (
            <div key={w.id}>
              <input
                type="checkbox"
                checked={w.addToList}
                onChange={() => toggleWordForList(w.id)}
              /> {w.noun} ({w.selected === w.article ? "✓" : "✗"})
            </div>
          ))}

          {!showSaveList ? (
            <button onClick={() => setShowSaveList(true)} style={{ marginTop: 12 }}>
              Save to Review List
            </button>
          ) : (
            <div style={{ marginTop: 12 }}>
              <input
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                placeholder="List name"
              />
              <button onClick={saveReviewList}>Save</button>
            </div>
          )}

          <button onClick={backToHome} style={{ marginTop: 20 }}>Home</button>
        </div>
      </div>
    );
  }

  // QUIZ / REVIEW
  return (
    <div style={styles.outer}>
      <div style={styles.container}>
        <h2>{mode === "quiz" ? "Quiz" : "Review"}</h2>
        <h1>{word.noun}</h1>

        <div style={{ display: "flex", gap: 10 }}>
          {["der", "die", "das"].map(a => (
            <button
              key={a}
              onClick={() => chooseArticle(a)}
              style={{
                background:
                  selected === a
                    ? a === word.article ? "#4caf50" : "#f44336"
                    : "#eee"
              }}
            >
              {a}
            </button>
          ))}
        </div>

        {selected && (
          <>
            <p>Correct: <strong>{word.article}</strong></p>
            {!showEnglish ? (
              <button onClick={() => setShowEnglish(true)}>Show English + Plural</button>
            ) : (
              <p>{word.english} · Plural: {word.plural}</p>
            )}
            <button onClick={nextWord}>Next</button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  outer: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    padding: 20,
    background: "#f9f9f9"
  },
  container: {
    width: "100%",
    maxWidth: 600,
    textAlign: "center"
  }
};
