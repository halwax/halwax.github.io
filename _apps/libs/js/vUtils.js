class VUtils {

  copyToClipboard(text) {

    if (window.clipboardData) {
      window.clipboardData.setData('Text', text);
      return;
    }
  
    // standard way of copying
    let textArea = document.createElement('textarea');
    textArea.setAttribute
      ('style', 'width:1px;border:0;opacity:0;');
    document.body.appendChild(textArea);
    textArea.value = text;
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }

  escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

}

