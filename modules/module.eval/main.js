let Module          = require('../module.js');

class Command extends Module {

	constructor(config, reqModule, reqCommand, message) {
        
        super(config, reqModule, reqCommand, message);

    }
    
	async process() {
			    
        if( !await this.auth() ) { return this.message.react(this.clientConfig.settings.reaction.DENIED); }

	    let prevaled = this.message.content.replace(`${this.clientConfig.settings.prefix}${this.command} `,'');
    	let evaled = "undefined";    	
    	
    	if( prevaled === '' || prevaled === "help" ) { return this.help( this.moduleConfig.help.eval ); }

    	try {
    		evaled = eval(prevaled);
    		if( typeof(evaled) === "undefined" ) { throw evaled; }
    		this.message.react(this.clientConfig.settings.reaction.SUCCESS);
    	} catch(e) {
    		evaled = e;
    		this.message.react(this.clientConfig.settings.reaction.ERROR);
    	}
  
    	if( !!evaled && typeof evaled === "object" && Object.keys(evaled).length > 0 ) {
    	    
    	    this.replyValue( evaled );
    	    
    	} else {
    	    
            this.replyEval( evaled );
    	    
    	}

	}
	
    async analyze() {
    }

    modules() {
	    
	    return JSON.stringify(this.clientConfig.registry,""," ");
	    
	}
	
	replyEval( replyStr ) {
    		
	    replyStr = !replyStr ? "undefined" : replyStr;
	    
    	const Discord = require('discord.js');
    	const embed = new Discord.RichEmbed();
    	embed.addField("Evaluated", this.codeBlock( replyStr ));
    	embed.addField("Results", this.codeBlock( this.message.content ));    	
        
        this.message.channel.send({embed}); 
        
    }
	
    replyValue( replyStr ) {

        replyStr = !replyStr ? { "result":"undefined" } : replyStr;
        
        let cache = [];
        replyStr = JSON.stringify(replyStr, function(key, value) {
            // Filtering out properties
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1 || value.length > 50) { return undefined; }             
                cache.push(value);
            }           
            return ( key === "database" || key === "token" || key === "client" ) ? new Array(10).join('*') : value;
        }, "  ");               
        cache = null;   
          
        replyStr = !replyStr ? "undefined" : replyStr;

        let dm = false;
        let title = "Value of ";

        const Discord = require('discord.js');
        let embed = new Discord.RichEmbed();
        embed.setColor(0x6F9AD3);

        while( replyStr.length >= 1000 ) {

            dm = true;
            const n = replyStr.lastIndexOf(",", 1000);
            let chunk = replyStr.slice(0,n+1);                  
            
            this.message.author.send(this.codeBlock(chunk));
            
            title += title.indexOf("...continued") === -1 ? "...continued" : "";          
            replyStr = replyStr.slice(n+1);

        }       

        //Add results and original command as embed fields
        embed.addField("Evaluated", this.codeBlock(replyStr));
        embed.addField("Results", this.codeBlock(this.message.content));

        //If already sent chunks to DM, send last bit to DM
        if( dm ) { 
            this.message.author.send({embed}); 
            this.message.react(this.clientConfig.settings.reaction.DM);
        } else { 
            this.message.channel.send({embed}); 
        }

    }
    
}

module.exports = Command;