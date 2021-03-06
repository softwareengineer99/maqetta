dojo.provide("davinci.theme.ThemeUtils");

davinci.theme.isThemeHTML = function(resource){
	return resource.getName().indexOf("dojo-theme-editor.html") > -1;
};

davinci.theme.CloneTheme = function(name, version, selector, directory, originalTheme, renameFiles){
	
	var fileBase = originalTheme.file.parent;
	var themeRootPath = new davinci.model.Path(directory).removeLastSegments(0);
	var resource = system.resource.findResource(themeRootPath.toString());
	if (resource.libraryId) {
		resource.createResource();
	}
	system.resource.copy(fileBase, directory, true);
	var themeRoot = system.resource.findResource(directory);
	var fileName = originalTheme.file.getName();
	/* remove the copied theme */
	var sameName = (name==originalTheme.name);
	var themeFile = null;
	if(!sameName){
		var badTheme = system.resource.findResource(directory + "/" + fileName);
		badTheme.deleteResource();
	}

	var directoryPath = new davinci.model.Path(themeRoot.getPath());
	var lastSeg = directoryPath.lastSegment();
	/* create the .theme file */
	if (!sameName) {
		themeFile = themeRoot.createResource(lastSeg + ".theme");
	} else{
		themeFile = system.resource.findResource(directory + "/" + fileName);
	}

	var themeJson = {
		className: selector,
		name: name,
		version: version || originalTheme.version, 
		specVersion: originalTheme.specVersion,
		files: originalTheme.files,
		meta: originalTheme.meta,
		themeEditorHtmls: originalTheme.themeEditorHtmls
	};

	if(originalTheme.helper){
	    themeJson.helper = originalTheme.helper; 
	}
	if(originalTheme.base){
        themeJson.base = originalTheme.base; 
    }
	
	
	
	var oldClass = originalTheme.className;
	var toSave = {};
	/* re-write CSS Selectors */
	for(var i=0;i<themeJson['files'].length;i++){
		var fileUrl = directoryPath.append(themeJson['files'][i]);
		
		var resource = system.resource.findResource(fileUrl);
		if(!sameName && renameFiles && resource.getName().indexOf(oldClass) > -1){
			var newName = resource.getName().replace(oldClass, selector);
			resource.rename(newName);
			themeJson['files'][i] =newName;
		}
		
		var cssModel = davinci.model.Factory.getInstance().getModel({url:resource.getPath(),
			includeImports: true,
			loader:function(url){
				var r1=  system.resource.findResource(url);
				return r1.getText();
			}
		});
		var elements = cssModel.find({elementType: 'CSSSelector', cls: oldClass});
		for(var i=0;i<elements.length;i++){
			elements[i].cls = selector;
			var file = elements[i].getCSSFile();
			toSave[file.url] = file;
			
		}
	}
	
	themeFile.setContents("(" + dojo.toJson(themeJson)+")");
	
	for(var name in toSave){
		toSave[name].save();
	}
	/* re-write metadata */
	
	for(var i=0;i<themeJson['meta'].length;i++){
		var fileUrl = directoryPath.append(themeJson['meta'][i]);
		var file = system.resource.findResource(fileUrl.toString());
		var contents = file.getText();
		var newContents = contents.replace(new RegExp(oldClass, "g"), selector);
		file.setContents(newContents);
	}
	
	/* rewrite theme editor HTML */
	for(var i=0;i<themeJson['themeEditorHtmls'].length;i++){
		var fileUrl = directoryPath.append(themeJson['themeEditorHtmls'][i]);
		var file = system.resource.findResource(fileUrl.toString());
		var contents = file.getText();
		var htmlFile = new davinci.html.HTMLFile(fileUrl);
		htmlFile.setText(contents,true);
		var element = htmlFile.find({elementType: 'HTMLElement', tag: 'body'}, true);
		element.setAttribute('class',selector);
		htmlFile.save();
	}
	davinci.library.themesChanged();
};

davinci.theme.getHelper = function(theme){
	if (!theme) { return; } //FIXME: should theme ever be falsey?
    if (theme._helper){
        return theme._helper;
    }
    var helper = theme.helper;// davinci.ve.metadata.queryDescriptor(type, "helper");
    if (helper) {
        try {
            dojo["require"](helper);
        } catch(e) {
            console.error("Failed to load helper: " + helper);
            console.error(e);
        }
        var aClass = dojo.getObject(helper);
        if (aClass) {
            theme._helper  = new aClass();
        }
        var obj = dojo.getObject(helper);
        return new obj();
    }
};


