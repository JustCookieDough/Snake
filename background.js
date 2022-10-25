chrome.runtime.onInstalled.addListener(reason => {
    if (reason.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.storage.sync.set({"highscore": 0, "snakeColor": "#000000", "backgroundColor": "#FFFFFF", "appleColor": "#FF0000", "navbarColor": "#ededed", "textColor": "#000000", "drawChunky": false, "darkSettings": false}, () => {
            console.log("defaults set")
        })
    }
})