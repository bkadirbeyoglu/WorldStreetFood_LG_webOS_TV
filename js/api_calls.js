//const ACCESS_KEY = "94145170-a02c-430c-afd257165891-d3a1-44cf";
//const LIBRARY_ID = 13766;
/* const OPTIONS = {
    method: "GET",
    headers: {
        Accept: "application/json",
        AccessKey: ACCESS_KEY
    }
}; */

//const URL_ROKU_XML = "http://rokuawgserver.ddns.net/ctv/channels/1/roku.xml";
const URL_ROKU_XML = "https://raw.githubusercontent.com/bkadirbeyoglu/WorldStreetFood/master/data/roku.xml";

let playlists = [];


function getChannelXML() {
    tryAtMost(5, function(resolve, reject) {
        fetch(URL_ROKU_XML)
        .then((response) => {
            if (response.status >= 200 && response.status <= 299) {
                resolve(response);

                return response.text();
            } 
            else {
                throw Error(response.statusText);
            }
        })
        .then(response => {
            if (window.DOMParser) {
				parser = new DOMParser();
				let xmlDoc = parser.parseFromString(response, "text/xml");
				//console.log(xmlDoc);

                let jsonData = new X2JS().xml2json(xmlDoc);
                let channel = jsonData.rss.channel;
                //console.log(_channel.item[5].content.thumbnail.url);
                
                let lookup = {};
                channel.item.forEach(item => {
                    let playlist = item.playlist;
                    if (!(playlist in lookup)) {
                        lookup[playlist] = 1;
                        playlists.push(new Object({ title: playlist, items: [] }));
                    }

                    playlists.find(pl => pl.title == playlist).items.push(item);
                });

                //getCollectionList();
                buildCollectionsScreen();
                displayCollectionsScreen();
			}
        })
        .catch(err => {
            console.error(err);

            reject(err);
        });
    });
        
}


/* function getCollectionList() {
    const url = `http://video.bunnycdn.com/library/${LIBRARY_ID}/collections??page=1&itemsPerPage=100&orderBy=date`;

    return new Promise(function (resolve, reject) {
        fetch(url, OPTIONS)
        .then((response) => {
            if (response.status >= 200 && response.status <= 299) {
                return response.json();
            } 
            else {
                throw Error(response.statusText);
            }
        })
        .then(response => {
            //console.log(response);
            collections = response.items;
            if (collections.length > 0) {
                getVideosInCollections();
            }
        })
        .catch(err => console.error(err));
    });
}


function getVideosInCollections() {
    let promises = [];

    collections.forEach(collection => {
        const _guid = collection.guid;
        const _url = `http://video.bunnycdn.com/library/${LIBRARY_ID}/videos?page=1&itemsPerPage=100&collection=${_guid}&orderBy=date`;

        promises.push(tryAtMost(5, function(resolve, reject) {
            fetch(_url, OPTIONS)
            .then((response) => {
                if (response.status >= 200 && response.status <= 299) {
                    return response.json();
                } 
                else {
                    throw Error(response.statusText);
                }
            })
            .then(response => resolve(response))
            .catch(err => {
                console.error(err);
                reject(err);
            });
        }));
    });

    Promise.allSettled(promises).then(function(results) {
        results.forEach((res, index) => {
            if (res.status == "fulfilled") {
                collections[index].videos = res.value.items;
            }
        });

        buildCollectionsScreen();
        displayCollectionsScreen();
    });
} */


function tryAtMost(triesLeft, executor) {
    if (triesLeft < 5) {
        console.log("trying, tries left: " + triesLeft);
    }
    --triesLeft;
    return new Promise(executor)
        .catch(err => triesLeft > 0 ? tryAtMost(triesLeft, executor) : Promise.reject(err));
}


// Polyfill for Promise.allSettled
if (!Promise.allSettled) {
	const rejectHandler = reason => ({ status: "rejected", reason });
	const resolveHandler = value => ({ status: "fulfilled", value });

	Promise.allSettled = function(promises) {
		const convertedPromises = promises.map(p => Promise.resolve(p).then(resolveHandler, rejectHandler));
		return Promise.all(convertedPromises);
	};
}


function getXML(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onload = function () {
		if (xhr.status === 200) {
			callback(null, xhr.response);
		}
		else {
			callback(xhr.status, xhr.responseText);
		}
	};
	xhr.send();
}