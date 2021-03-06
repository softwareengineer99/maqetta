dojo.provide("davinci.review.actions.OpenVersionAction");

dojo.require("davinci.actions.Action");
dojo.require("dojox.widget.Toaster");

dojo.require("dojo.i18n");  
dojo.requireLocalization("davinci.review.actions", "actions");

dojo.declare("davinci.review.actions.OpenVersionAction",davinci.actions.Action,{
	run: function(context){
	var selection = davinci.Runtime.getSelection();
	if(!selection) return;
	var item = selection[0].resource.elementType=="ReviewFile"?selection[0].resource.parent:selection[0].resource;
		dojo.xhrGet({url:"./cmd/managerVersion",sync:false,handleAs:"text",
			content:{
			'type' :'open',
			'vTime':item.timeStamp}
		}).then(function (result){
			if (result=="OK")
            {
            	if(typeof hasToaster == "undefined"){
	            	new dojox.widget.Toaster({
	            			position: "br-left",
	            			duration: 4000,
	            			messageTopic: "/davinci/review/resourceChanged"
	            	});
	            	hasToaster = true;
            	}
            	var langObj = dojo.i18n.getLocalization("davinci.review.actions", "actions");
            	dojo.publish("/davinci/review/resourceChanged", [{message:langObj.openSuccessful, type:"message"},"open",item]);
            }
		});
	},

	shouldShow: function(context){
		return true;
	},
	
	isEnabled: function(context){
		if(davinci.review.Runtime.getRole()!="Designer") return false;
		var selection = davinci.Runtime.getSelection();
		if(!selection || selection.length == 0) return false;
		var item = selection[0].resource.elementType=="ReviewFile"?selection[0].resource.parent:selection[0].resource;
		if(item.closed&&item.closedManual&&!item.isDraft) return true;
		return false;
	}
});