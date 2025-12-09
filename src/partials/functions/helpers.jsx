export function triggerMouseEvent(node, eventType) {
  var clickEvent = new Event(eventType, { bubbles: true, cancelable: true });
  node.dispatchEvent(clickEvent);
}

export function readFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(reader.result), false)
    reader.readAsDataURL(file)
  })
}

export function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[arr.length - 1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export function imageExists(image_url){

  var http = new XMLHttpRequest();

  http.open('HEAD', image_url, false);
  http.send();

  return http.status != 404;

}


export function restrictNonNumeric(e){
  if (e.ctrlKey) { return; }
  if (e.key.length > 1) { return; }
  if (/[0-9]/.test(e.key)) { return; }
  e.preventDefault();
}


export default {triggerMouseEvent, dataURLtoFile, readFile, imageExists, restrictNonNumeric}


