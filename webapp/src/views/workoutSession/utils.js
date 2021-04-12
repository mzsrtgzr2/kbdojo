export const speak = (text, rate=1)=>{
  if (!!SpeechSynthesisUtterance){
    var msg = new SpeechSynthesisUtterance('No warning should arise');
    msg.lang = 'en-EN';
    msg.rate = rate;
    msg.text=text;
    // window.speechSynthesis.speak(msg);
  }
}