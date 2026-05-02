useEffect(() => {
  try {
    localStorage.setItem("stash-snap-data", JSON.stringify(stash));
  } catch (error) {
    console.error("Could not save stash to localStorage:", error);
    alert("This fabric photo is too large to save. Try adding the fabric without a photo for now.");
  }
}, [stash]);
