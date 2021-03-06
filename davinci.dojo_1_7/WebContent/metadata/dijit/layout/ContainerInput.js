define([
        "dojo/_base/declare",
        "davinci/ve/input/SmartInput"
], function(declare, SmartInput){

return declare("davinci.libraries.dojo.dijit.layout.ContainerInput", SmartInput, {

	propertyName: null,
	
	childType: null,

	property: null,
	
	displayOnCreate: "true",
	
	format: "columns",
	
	serialize: function(widget, callback, value) {
		var result = [];
		var children = widget.getChildren();
		
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			var dijitWidget = child.dijitWidget;
			if(dijitWidget){
				var djprop = (this.propertyName==="textContent") ? "innerHTML" : this.propertyName;
				result.push(child.attr(djprop));
			}else{
				result.push("");
			}
		}
		
		result = this.serializeItems(result);

		callback(result); 
	},
	
	parse: function(input) {
		var result = this.parseItems(input);
		return result;
	},
	
	getChildType: function(parentType){
		if (!this.childType){
			var allowedChild = davinci.ve.metadata.getAllowedChild(parentType);
			this.childType = allowedChild[0];
		}
		return this.childType;
	},
	
	update: function(widget, value) {		
		var values = value;
		
		this.command = new davinci.commands.CompoundCommand();

		var children = widget.getChildren();
		for (var i = 0; i < values.length; i++) {
			var text = values[i].text;
			//text = dojox.html.entities.encode(text);
			if (this.isHtmlSupported() && (this.getFormat() === 'html')) // added to support dijit.TextBox that does not support html markup in the value and should not be encoded. wdr
				text = dojox.html.entities.encode(text);
			if (i < children.length) {
				var child = children[i];
				this._attr(child, this.propertyName, text);
			} else {
				this._addChildOfTypeWithProperty(widget, this.getChildType(widget.type), this.propertyName, text);
			}
		}
		
		if (values.length > 0) {
			for (var i = values.length; i < children.length; i++) {
				var child = children[i];
				this._removeChild(child);
			}
		}

		this._addOrExecCommand();
	},
	
	_attr: function(widget, name, value) {
		var properties = {};
		properties[name] = value;
		
		var command = new davinci.ve.commands.ModifyCommand(widget, properties);
		this._addOrExecCommand(command);
	},
	
	_removeChild: function(widget) {
		var command = new davinci.ve.commands.RemoveCommand(widget);
		this._addOrExecCommand(command);
	},
	
	_addChildOfTypeWithProperty: function(widget, type, propertyName, value) {
		var data = {type: type, properties: {}, context: this._getContext()};
		data.properties[propertyName] = value;
		
		var child = undefined;
		dojo.withDoc(this._getContext().getDocument(), function(){
			child = davinci.ve.widget.createWidget(data);
		}, this);
		
		var command = new davinci.ve.commands.AddCommand(child, widget);
		this._addOrExecCommand(command);
	},
	
	_addOrExecCommand: function(command) {
		if (this.command && command) {
			this.command.add(command);
		} else {
			this._getContext().getCommandStack().execute(this.command || command);
		}	
	},
	
	_getContainer: function(widget){
		while(widget){
			if ((widget.isContainer || widget.isLayoutContainer) && widget.declaredClass != "dojox.layout.ScrollPane"){
				return widget;
			}
//			debugger;
			widget = davinci.ve.widget.getParent(widget); 
		}
		return undefined;
	},
	
	_getEditor: function() {
		return top.davinci && top.davinci.Runtime && top.davinci.Runtime.currentEditor;
	},
	
	_getContext: function() {
		var editor = this._getEditor();
		return editor && (editor.getContext && editor.getContext() || editor.context);
	}
});
});
