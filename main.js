// router
const links = document.querySelector(".header__bot-links").querySelectorAll("a")

function changeActiveLink() {
  for (const link of links) {
    if (location.hash === "") {
      links[0].classList.add("header__bot-link--active")
      break
    }
    if (link.href === location.href)
      link.classList.add("header__bot-link--active")
    else link.classList.remove("header__bot-link--active")
  }
}

const route = (event) => {
  event.preventDefault()
  history.pushState(null, null, event.target.href)
  handleLocation()
}

for (const link of links) {
  link.addEventListener("click", route)
}

const routes = {
  "": "./pages/activity.html",
  activity: "./pages/activity.html",
  map: "./pages/map.html",
  timer: "./pages/timer.html",
  404: "./pages/404.html",
}

const handleLocation = async () => {
  const path = location.hash.slice(1)
  const route = routes[path] || routes[404]
  const html = await fetch(route).then((data) => data.text())
  const root = document.querySelector("#root")
  root.innerHTML = html
  changeActiveLink()

  if (path === "timer") timer()
  else clearInterval(pageTimerId)

  if (path === "map") createMap()
}

window.onpopstate = handleLocation
handleLocation()

// timer
let pageTimerId

function timer() {
  const timer = document.querySelector(".timer__time")

  timer.textContent = convertSecondsToHHMMSS(currentTime)

  pageTimerId = setInterval(() => {
    timer.textContent = convertSecondsToHHMMSS(currentTime)
  }, 1000)
}

let currentTime = 0

setInterval(() => {
  currentTime++
}, 1000)

function convertSecondsToHHMMSS(seconds) {
  const pad = (num) => num.toString().padStart(2, "0")
  const hours = pad(Math.floor(seconds / 3600))
  const minutes = pad(Math.floor((seconds % 3600) / 60))
  const sec = pad(Math.floor(seconds % 60))
  return `${hours}:${minutes}:${sec}`
}

// map
async function createMap() {
  createSpinner()
  await loadSrc("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css", "css")
  await loadSrc("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js", "script")

  navigator.geolocation.getCurrentPosition((position) => {
    const latitude = position.coords.latitude
    const longitude = position.coords.longitude
    const zoom = 14

    // Set DIV element to embed map
    var mymap = L.map("map")

    // Add initial marker & popup window
    var mmr = L.marker([0, 0])
    // mmr.bindPopup("0,0")
    mmr.addTo(mymap)

    // Add copyright attribution
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", {
      foo: "bar",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mymap)

    // Set lat lng position and zoom level of map
    mmr.setLatLng(L.latLng(latitude, longitude))
    mymap.setView([latitude, longitude], zoom)

    // Set popup window content
    mmr
      .setPopupContent(
        "Latitude: " + latitude + " <br /> Longitude: " + longitude
      )
      .openPopup()

    // Set marker onclick event
    mmr.on("click", openPopupWindow)

    // Marker click event handler
    function openPopupWindow(e) {
      mmr
        .setPopupContent(
          "Latitude: " + e.latlng.lat + " <br /> Longitude: " + e.latlng.lng
        )
        .openPopup()
    }
  })

  removeSpinner()
}

function loadSrc(url, type) {
  return new Promise((resolve) => {
    if (type === "css") {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = url
      document.head.append(link)
      link.onload = () => resolve()
    } else if (type === "script") {
      const script = document.createElement("script")
      script.src = url
      document.head.append(script)
      script.onload = () => resolve()
    }
  })
}

function createSpinner() {
  const map = document.getElementById("map")
  const spinner = document.createElement("div")
  spinner.classList.add("spinner-border")
  spinner.classList.add("text-primary")
  spinner.role = "status"
  spinner.innerHTML = `<span class="visually-hidden">Loading...</span>`
  map.append(spinner)
}

function removeSpinner() {
  const spinner = document.querySelector(".spinner-border")
  spinner.remove()
}
