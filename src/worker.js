//
// Worker
//

self.addEventListener('message', (e) => {
    var message = e.data + 'to myself!';
    self.postMessage(message);
    self.close();
});
