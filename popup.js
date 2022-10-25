const settings = document.getElementById('settings')
const navbar = document.getElementById('navbar')

const getColorDict = async () => {
    return new Promise( (resolve, reject) => {
        try {
            chrome.storage.sync.get(['textColor', 'navbarColor'], (dict) => {
                resolve(dict)
            })
        } catch (ex) {
            reject(ex)
        }
    })
}

async function main() {
    colorDict = await getColorDict()
    navbar.style.backgroundColor = colorDict['navbarColor']
    navbar.style.color = colorDict['textColor']
}

main()

settings.addEventListener('click', () => {
    chrome.tabs.create({
        url: "settings.html"
    });
})