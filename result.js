console.log("boom")

chrome.storage.session.get("latestResult", (data) => {
  const result = data.latestResult;
  if (!result) return;
  console.log("this is result:",result)
//   document.getElementById("content").classList.remove("hidden");

  document.getElementById("confidence").textContent =
    `Confidence: ${result.confidence}%`;

  document.getElementById("analysis").textContent =
    result.analysis;

  document.getElementById("bar").style.width =
    result.confidence + "%";
});