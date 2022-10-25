const resetHighscore = document.getElementById('resetHighscore')
const colorButton = document.getElementById('colorFormButton')
const colorForm = document.getElementById('colorForm')
const highScoreText = document.getElementById('highScoreText')
const defaultsButton = document.getElementById('defaultsButton')
const chunkyMode = document.getElementById('chunkyCheck')
const darkMode = document.getElementById('darkCheck')

resetHighscore.addEventListener('click', () => {
    chrome.storage.sync.set({'highscore': 0}, () => {
        console.log('highscore reset to 0')
        updateValues()
    })
})

colorButton.addEventListener('click', () => {
    elem = colorForm.elements
    chrome.storage.sync.set({'snakeColor': elem[0].value, 'backgroundColor': elem[1].value, 'appleColor': elem[2].value, 'navbarColor': elem[3].value, 'textColor': elem[4].value}, () => {
        console.log('colors set')
        updateValues()
    })
})

defaultsButton.addEventListener('click', () => {
    chrome.storage.sync.set({"highscore": 0, "snakeColor": "#000000", "backgroundColor": "#FFFFFF", "appleColor": "#FF0000", "navbarColor": "#ededed", "textColor": "#000000", "drawChunky": false, "darkSettings": false}, () => {
        console.log("defaults restored")
        updateValues()
    })
})

chunkyMode.addEventListener('change', () => {
    chrome.storage.sync.set({'drawChunky': chunkyMode.checked}, () => {
        console.log('chunky mode updated')
    })
})

darkMode.addEventListener('change', () => {
    updateDarkMode() 
    chrome.storage.sync.set({'darkSettings': darkMode.checked}, () => {
        console.log('dark mode set')
    })
})

function updateDarkMode() {
    if (darkMode.checked) {
        document.body.className = "dark"
    } else {
        document.body.className = "light"
    }
}

function updateValues() {
    chrome.storage.sync.get(['highscore', 'snakeColor', 'backgroundColor', 'appleColor', 'navbarColor', 'textColor', 'drawChunky', 'darkSettings'], (dict) => {
        highScoreText.innerHTML = `Current High Score: ${dict['highscore']}`
        colorForm.elements[0].value = dict['snakeColor']
        colorForm.elements[1].value = dict['backgroundColor']
        colorForm.elements[2].value = dict['appleColor']
        colorForm.elements[3].value = dict['navbarColor']
        colorForm.elements[4].value = dict['textColor']
        chunkyMode.checked = dict['drawChunky']
        darkMode.checked = dict['darkSettings']
        updateDarkMode()
        
    })
}

updateValues()