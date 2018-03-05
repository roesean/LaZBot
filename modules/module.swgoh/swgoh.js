async function add( obj, register ) {
	
	try {
		
		let discordId, playerId, playerName, allycode, playerGuild, playerPrivate = null;

		discordId = obj.cmdObj.args.discordId;
		allycode = obj.cmdObj.args.allycode;
		
		playerPrivate = register && register[0] && register[0].private ? register[0].private : 0;
		
		let result = null;    
	    try {
	    	result = await require('./utilities.js').fetchPlayer( allycode, obj );        
	        if( !result || !result[0] ) { return obj.fail('The requested player cannot be found.'); }
	    } catch(e) {
	        return obj.error('add.fetchPlayer', e);
	    }
	    
	    await obj.message.react(obj.clientConfig.settings.reaction.WORKING);
	
		playerId 	= result[0].playerId;
		playerName 	= result[0].name;
		playerGuild = result[0].guildName;
		playerPrivate = obj.cmdObj.args.text.includes('private') ? 1 : playerPrivate;
		playerPrivate = obj.cmdObj.args.text.includes('public') && discordId === obj.message.author.id ? 0 : playerPrivate;
				
		try {
			const DatabaseHandler = require(obj.clientConfig.path+'/utilities/db-handler.js');
			result = await DatabaseHandler.setRows(obj.clientConfig.settings.database, obj.moduleConfig.queries.SET_REGISTER, [discordId, playerId, playerName, allycode, playerGuild, playerPrivate]);
	    } catch(e) {
	        return obj.error('add.addPlayer', e);
	    }
	    await obj.message.react(obj.clientConfig.settings.reaction.SUCCESS);
	    return obj.success();
	} catch(e) {
		obj.error('swgoh.add',e);
	}
	
}

async function remove( obj, register ) {

	try {
	    let discordId, playerId, playerName, allycode, playerGuild = null;
	    let replyStr = 'Not Found!';
		
		playerId  = obj.cmdObj.args.playerId;
	    allycode  = obj.cmdObj.args.allycode;
		
	    let result = null;
	    try {
	    	const DatabaseHandler = require(obj.clientConfig.path+'/utilities/db-handler.js');
	    	result = await DatabaseHandler.setRows(obj.clientConfig.settings.database, obj.moduleConfig.queries.DEL_REGISTER, [playerId, allycode]);
	    } catch(e) {
	        return obj.error('remove.fetchPlayer', e);
	    }
	    
		await obj.message.react(obj.clientConfig.settings.reaction.SUCCESS);
	    return obj.success();
	} catch(e) {
		obj.error('swgoh.remove',e);
	}
	
}

async function update( obj, register ) {
	
	try {
		
		let result, discordId, playerId, playerName, allycode, playerGuild = null;

	    try {
	    	const DatabaseHandler = require(obj.clientConfig.path+'/utilities/db-handler.js');
		    result = register || await DatabaseHandler.getRegister( obj );
		    if( !result || !result[0] || !result[0].allyCode ) { return obj.fail('The requested user is not registered'); }
	    } catch(e) {
	        return obj.error('sync.getRegister',e);
	    }
	    
		discordId = result[0].discordId;
		playerName = result[0].playerName;
		allycode = result[0].allyCode.toString();
	    playerGuild = result[0].playerGuild;
		playerPrivate = obj.cmdObj.args.text.includes('private') ? 1 : result[0].private;
		playerPrivate = obj.cmdObj.args.text.includes('public') && discordId === obj.message.author.id ? 0 : playerPrivate;
		
	    try {
	    	result = await require('./utilities.js').fetchPlayer( allycode, obj );        
	        if( !result || !result[0] ) { return obj.fail('The requested player cannot be found.'); }
	    } catch(e) {
	        return obj.error('add.fetchPlayer', e);
	    }
	    
	    await obj.message.react(obj.clientConfig.settings.reaction.WORKING);
	
		playerId 	= result[0].playerId;
		playerName 	= result[0].name;
		playerGuild = result[0].guildName;
		
	    try {
			const DatabaseHandler = require(obj.clientConfig.path+'/utilities/db-handler.js');
			result = await DatabaseHandler.setRows(obj.clientConfig.settings.database, obj.moduleConfig.queries.SET_REGISTER, [discordId, playerId, playerName, allycode, playerGuild, playerPrivate]);
	    } catch(e) {
	        return obj.error('add.addPlayer', e);
	    }
	    await obj.message.react(obj.clientConfig.settings.reaction.SUCCESS);
	    return obj.success();
	} catch(e) {
		obj.error('swgoh.add',e);
	}

}


async function find( obj, register ) {
	
	try {
	    let result, discordId, playerId, playerName, allycode, playerGuild = null;
	    
	    try {
	    	const DatabaseHandler = require(obj.clientConfig.path+'/utilities/db-handler.js');
		    result = register || await DatabaseHandler.getRegister( obj );
		    if( !result || !result[0] || !result[0].allyCode ) { return obj.fail('The requested user is not registered'); }
	    } catch(e) {
	        return obj.error('find.getRegister',e);
	    }
	                      	
	    let replyObj = {};
	    replyObj.title = 'Results for ';
	    replyObj.title += result[0].playerName;
	    
	    let ac = result[0].private === 1 ? '---------' : result[0].allyCode;
	    replyObj.description = '**Discord**   : '+result[0].discordId+'\n';
	    replyObj.description += '**Player**      : '+result[0].playerName+'\n';
	    replyObj.description += '**Guild**        : '+result[0].playerGuild+'\n';
	    replyObj.description += '**AllyCode** : '+ac+'\n';
	            
	    let ud = new Date();
		ud.setTime(result[0].updated);
		ud = ud.toISOString().replace(/T/g,' ').replace(/\..*/g,'');
	    replyObj.text += 'Updated: '+ud;
	
	    return obj.success( replyObj );
	} catch(e) {
		obj.error('swgoh.find',e);
	}
	
}

    

/** EXPORTS **/
module.exports = { 
	add: async ( obj, register ) => { 
    	return await add( obj, register ); 
    },
    remove: async ( obj, register ) => { 
    	return await remove( obj, register ); 
    },
    update: async ( obj, register ) => { 
    	return await update( obj, register ); 
    },
    find: async ( obj, register ) => { 
    	return await find( obj, register ); 
    }
}