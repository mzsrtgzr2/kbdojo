export const speak = (text)=>{
  if (!!SpeechSynthesisUtterance){
    var msg = new SpeechSynthesisUtterance('No warning should arise');
    msg.lang = 'en-EN';
    msg.text=text;
    window.speechSynthesis.speak(msg);
  }
}