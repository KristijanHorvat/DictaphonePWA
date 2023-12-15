const staticCacheName = "static-cache-v1";

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function (cache) {
      return cache.addAll([
        'offline.html',
        '404.html',
        'app.js',
        'manifest.json',
        '/'
        // Add other assets you want to cache here
      ]);
    })
  );
});
/*
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.filter(function (cacheName) {
          return cacheName.startsWith('static-cache-v1') && cacheName !== staticCacheName;
        }).map(function (cacheName) {
          return caches.delete(cacheName); // Delete old caches
        })
      );
    })
  );
});
*/
self.addEventListener
  ("activate", (event) => {
    const cacheWhitelist
      = [staticCacheName];
    event.waitUntil
      (
        caches.keys().then((cacheNames) => {
          return Promise.all
            (
              cacheNames.map((cacheName) => {
                if (cacheWhitelist.indexOf(cacheName) === -1) {
                  return caches.delete(cacheName);
                }
              })
            );
        })
      );
  });

  self.addEventListener('fetch', (event) => {
    const request = event.request;
    
    // Check if the request is for an audio file
    if (request.url.includes('.wav')) {
      // Bypass caching for audio files
      event.respondWith(fetch(request));
    } else {
      // Cache other requests as usual
      event.respondWith(
        caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).then((fetchResponse) => {
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return caches.match('404.html');
            }
            const responseToCache = fetchResponse.clone();
            caches.open(staticCacheName).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return fetchResponse;
          }).catch(() => {
            return caches.match('offline.html');
          });
        })
      );
    }
  });
  


self.addEventListener('sync', function (event) {
  if (event.tag === 'uploadRecordings') {
    event.waitUntil(uploadRecordings());
  }
});

function uploadRecordings() {
  const request = indexedDB.open('RecordingsDB', 1);

  request.onerror = function (event) {
    // Handle errors while opening the database
    console.error('Database error: ', event.target.error);
  };
  console.log("indexdbb");
  request.onsuccess = function (event) {
    const db = event.target.result;

    // Start a transaction and get an object store
    const transaction = db.transaction(['recordings'], 'readonly');
    const objectStore = transaction.objectStore('recordings');

    // Open a cursor to iterate through the records
    objectStore.openCursor().onsuccess = function (cursorEvent) {
      const cursor = cursorEvent.target.result;
      if (cursor) {
        // Access each record here, for example:
        const record = cursor.value;
        console.log('Record:', record);
        uploadRec(record);
        // Move to the next record
        cursor.continue();
      } else {
        // No more records
        console.log('No more records');
      }
    };
  };
}

async function uploadRec(recording) {
  const formData = new FormData()
  formData.append('name', recording.name)
  formData.append('blob', recording.blob)

  console.log("name prije up: " + recording.name)
  console.log("blob prije up: " + recording.blob)
  console.log("json stringify name : " + JSON.stringify(recording.name))
  console.log("json stringify blob: " + JSON.stringify(recording.blob))


  fetch('/upload', {
    method: 'POST',
    body: formData,

  })
    .then(response => {
      if (response.ok) {
        console.log('File uploaded successfully!');
      } else {
        console.error('File upload failed.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
}
