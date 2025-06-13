import { useEffect } from 'react';

const Chatbot = () => {
  useEffect(() => {
    const inlineScript = document.createElement('script');
    inlineScript.innerHTML = `
      (function(){
        if(!window.chatbase || window.chatbase("getState")!=="initialized"){
          window.chatbase = (...arguments) => {
            if(!window.chatbase.q){ window.chatbase.q=[] }
            window.chatbase.q.push(arguments)
          };
          window.chatbase = new Proxy(window.chatbase,{
            get(target, prop){
              if(prop === "q"){ return target.q }
              return (...args) => target(prop, ...args)
            }
          })
        }
        const onLoad = function(){
          const script = document.createElement("script");
          script.src = "https://www.chatbase.co/embed.min.js";
          script.id = "6WkR4AnzQqgIQdzuPahVR";
          script.domain = "www.chatbase.co";
          document.body.appendChild(script)
        };
        if(document.readyState === "complete"){ onLoad() }
        else { window.addEventListener("load", onLoad) }
      })();
    `;
    document.body.appendChild(inlineScript);

    const resizeInterval = setInterval(() => {
      const iframe = document.getElementById('chatbase-frame');
      if (iframe) {
        iframe.style.width = '300px';
        iframe.style.height = '500px';
        clearInterval(resizeInterval);
      }
    }, 500); // chequea cada 500 ms

    return () => clearInterval(resizeInterval);
  }, []);

  return null;
};

export default Chatbot;
