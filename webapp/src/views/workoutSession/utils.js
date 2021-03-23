export const speak = (text)=>{
  var msg = new SpeechSynthesisUtterance('No warning should arise');
  msg.lang = 'en-EN';
  msg.text=text;
  window.speechSynthesis.speak(msg);
}