YUI.add("datatable-row-select",function(g){var c="selectedRows",b={ROW_CLICK_EVENT:"rowClickEvent"},f="yui3-datatable-highlighted",e="yui3-datatable-selected",d="yui3-datatable-row-select";function a(){a.superclass.constructor.apply(this,arguments);}g.mix(a,{NS:"rowSelect",NAME:"dataTableRowSelect",EVENTS:b,ATTRS:{selectedRows:{value:new g.ArrayList()},selectionMode:{value:"standard",validator:g.Lang.isString}}});g.extend(a,g.Plugin.Base,{_host:null,_delegateOver:null,_delegateOut:null,_delegateClick:null,_anchorRow:null,initializer:function(){this._host=this.get("host");this._host.get("contentBox").addClass(d);this.afterHostEvent("render",this._setup);this.afterHostMethod("_addTbodyNode",this._unselectAllRows);},destructor:function(){this._delegateOver.detach();this._delegateOut.detach();this._delegateClick.detach();this._host.get("contentBox").removeClass(d);this._unselectAllRows();},_setup:function(){var h=this._host.get("contentBox");this.publish(b.ROW_CLICK_EVENT,{defaultFn:this._defSelectedFn});this._delegateOver=h.delegate("mouseover",function(i){i.currentTarget.addClass(f);},'tbody tr:not([selectable="false"])');this._delegateOut=h.delegate("mouseout",function(i){i.currentTarget.removeClass(f);},'tbody tr:not([selectable="false"])');this._delegateClick=h.delegate("click",function(i){this.fire(b.ROW_CLICK_EVENT,{rowTarget:i.currentTarget,shiftKey:i.shiftKey,ctrlKey:i.ctrlKey,metaKey:i.metaKey});},'tbody tr:not([selectable="false"])',this);},_defSelectedFn:function(h){var i=this.get("selectionMode");if(i==="single"){this._handleSingleSelectionByMouse(h);}else{this._handleStandardSelectionByMouse(h);}},_handleSingleSelectionByMouse:function(h){this._unselectAllRows();this._anchorRow=h.rowTarget;this._selectRow(h.rowTarget);},_handleStandardSelectionByMouse:function(o){var j=o.shiftKey,m=o.ctrlKey||(g.UA.webkit&&o.metaKey),p=o.rowTarget,h,n,l,k=this._host._tbodyNode.all("tr");if(j&&m){if(this._anchorRow){n=this._getTrEl(this._anchorRow).sectionRowIndex;l=this._getTrEl(p).sectionRowIndex;if(this._isSelected(this._anchorRow)){if(n<l){for(h=n+1;h<=l;h++){this._selectRowIfNotSelected(k.item(h));}}else{for(h=n-1;h>=l;h--){this._selectRowIfNotSelected(k.item(h));}}}else{if(n<l){for(h=n+1;h<=l-1;h++){this._unselectRowIfSelected(k.item(h));}}else{for(h=l+1;h<=n-1;h++){this._unselectRowIfSelected(k.item(h));}}this._selectRow(p);}}else{this._anchorRow=p;this._toggleSelectionOfRow(p);}}else{if(j){this._unselectAllRows();if(this._anchorRow){n=this._getTrEl(this._anchorRow).sectionRowIndex;l=this._getTrEl(p).sectionRowIndex;if(n<l){for(h=n;h<=l;h++){this._selectRow(k.item(h));}}else{for(h=n;h>=l;h--){this._selectRow(k.item(h));}}}else{this._anchorRow=p;this._selectRow(p);}}else{if(m){this._anchorRow=p;this._toggleSelectionOfRow(p);}else{this._handleSingleSelectionByMouse(o);}}}},_selectRowIfNotSelected:function(h){if(!this._isSelected(h)){this._selectRow(h);}},_unselectRowIfSelected:function(h){if(this._isSelected(h)){this._unselectRow(h);}},_toggleSelectionOfRow:function(h){if(this._isSelected(h)){this._unselectRow(h);}else{this._selectRow(h);}},_unselectAllRows:function(){var h=this._host._tbodyNode;h.all("tr"+"."+e).each(function(i){this._unselectRow(i);},this);if(this.get(c).size()!==0){this.set(c,new g.ArrayList());}},_selectRow:function(h){if(!this._anchorRow){this._anchorRow=h;}h.addClass(e);this.get(c).add(h);},_unselectRow:function(h){h.removeClass(e);this.get(c).remove(h);},_isSelected:function(h){return h.hasClass(e);},_getTrEl:function(h){return document.getElementById(h.get("id"));}});g.namespace("Plugin").DataTableRowSelect=a;},"@VERSION@",{requires:["datatable-base","plugin","node","event","event-delegate","arraylist","arraylist-add"]});