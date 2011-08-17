YUI.add('datatable-row-select', function(Y) {

/**
 * Plugs DataTable with row highlighting and selection functionality.
 * @module datatable
 * @submodule datatable-row-select
 */

/**
 * Adds row highlighting and selection functionality to DataTable.
 * @class DataTableRowSelect
 * @extends Plugin.Base
 */

var SELECTED_ROWS = 'selectedRows',
    EVENTS = {
      ROW_CLICK_EVENT : 'rowClickEvent'
    },

    CLASS_HIGHLIGHTED = 'yui3-datatable-highlighted',
    CLASS_SELECTED = 'yui3-datatable-selected',
    CLASS_ROW_SELECT = 'yui3-datatable-row-select';

function DataTableRowSelect() {
    DataTableRowSelect.superclass.constructor.apply(this, arguments);
}

Y.mix(DataTableRowSelect, {
  /**
   * The namespace for the plugin. This will be the property on the host
   * which references the plugin instance.
   *
   * @property NS
   * @type String
   * @static
   * @final
   * value 'rowSelect'
   */
  NS : 'rowSelect',

  /**
   * Class name.
   *
   * @property NAME
   * @type String
   * @static
   * @final
   * @value 'dataTableRowSelect'
   */
  NAME : 'dataTableRowSelect',

  EVENTS : EVENTS,

  ATTRS : {
    /**
     * @description An array containing a list of the rows that have been selected.
     * The array contains the <tr> nodes from the <tbody> of the underlying <table>.
     *
     * @attribute selectedRows
     * @public
     * @type ArrayList
     */
    selectedRows : {
      value : new Y.ArrayList()
    },
    /**
     * @description The row selection mode. Can be either 'single' for single row
     * selection, or 'standard' (default) for multiple row selection using the CTRL
     * and SHIFT keys in combination with a mouse click.
     *
     * @attribute selectionMode
     * @public
     * @type String
     */
    selectionMode : {
      value : "standard",
      validator : Y.Lang.isString
    }
  }
});

Y.extend(DataTableRowSelect, Y.Plugin.Base, {

  /**
   * @description The underlying DataTable widget.
   * @property _host
   * @private
   */
  _host : null,

  /**
   * @description The delegate method for the mouseover event.
   * @property _delegateOver
   * @private
   */
  _delegateOver : null,

  /**
   * @description The delegate method for the mouseout event.
   * @property _delegateOut
   * @private
   */
  _delegateOut : null,

  /**
   * @description The delegate method for the (row) click event.
   * @property _delegateClick
   * @private
   */
  _delegateClick : null,

  /**
   * @description The row instance of the row selection anchor. This is a <tr>
   * node from the <tbody> of the <table>.
   *
   * @property _anchorRow
   * @private
   */
  _anchorRow : null,

  /**
   * @description Initializes the row selection plugin.
   * @private
   * @method initializer
   */
  initializer : function() {
     Y.log('initializer', 'info', 'plugin-row-select');
     this._host = this.get('host');
     this._host.get('contentBox').addClass(CLASS_ROW_SELECT);
     this.afterHostEvent('render', this._setup);
     this.afterHostMethod('_addTbodyNode', this._unselectAllRows);
  },

  /**
   * @description The destructor. Cleans up after the row selection plugin.
   * @private
   * @method destructor
   */
  destructor : function() {
     Y.log('destructor', 'info', 'plugin-row-select');

     this._delegateOver.detach();
     this._delegateOut.detach();
     this._delegateClick.detach();

     this._host.get('contentBox').removeClass(CLASS_ROW_SELECT);
     this._unselectAllRows();
  },

  /**
   * @description Sets up the row selection plugin. Publishes the row click event.
   * Initializes the event delegate methods.
   *
   * @protected
   * @method _setup
   */
  _setup : function() {
     Y.log('_setup', 'info', 'plugin-row-select');
     var cb = this._host.get('contentBox');

     this.publish(EVENTS.ROW_CLICK_EVENT, {defaultFn: this._defSelectedFn});

     this._delegateOver = cb.delegate('mouseover', function(e) {
        e.currentTarget.addClass(CLASS_HIGHLIGHTED);
     }, 'tbody tr:not([selectable="false"])');

     this._delegateOut = cb.delegate('mouseout', function(e) {
        e.currentTarget.removeClass(CLASS_HIGHLIGHTED);
     }, 'tbody tr:not([selectable="false"])');

     // Need shiftKey and ctrlKey for 'standard' row selection mode.
     this._delegateClick = cb.delegate('click', function(e) {
        this.fire(EVENTS.ROW_CLICK_EVENT, {
           // The metaKey (Command key) is used for when running Safari on a Mac.
           rowTarget: e.currentTarget, shiftKey: e.shiftKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey});
     }, 'tbody tr:not([selectable="false"])', this);
  },

  /**
   * @description The default row selection function. Determines the row selection
   * mode ('single' or 'standard') and invokes the corresponding selection handler.
   *
   * @method _defSelectedFn
   * @param e.rowTarget {HTMLElement} Target row element. A <tr> node in the <tbody>.
   * @param e.shiftKey {Boolean} If the shift key was pressed.
   * @param e.ctrlKey {Boolean} If the ctrl key was pressed.
   * @param e.metaKey {Boolean} If the meta key was pressed (Command key on a Mac).
   * @protected
   */
  _defSelectedFn : function(e) {
     Y.log('_defSelectedFn', 'info', 'plugin-row-select');
     var selectionMode = this.get('selectionMode');

     if (selectionMode === "single") {
        this._handleSingleSelectionByMouse(e);
     } else {
        this._handleStandardSelectionByMouse(e);
     }
  },

  /**
   * @description Determines the selection behavior resulting from a mouse event
   * when the selection mode is set to 'single'.
   *
   * @method _handleSingleSelectionByMouse
   * @param e.rowTarget {HTMLElement} Target row element. A <tr> node in the <tbody>.
   * @param e.shiftKey {Boolean} If the shift key was pressed.
   * @param e.ctrlKey {Boolean} If the ctrl key was pressed.
   * @param e.metaKey {Boolean} If the meta key was pressed (Command key on a Mac).
   * @private
   */
  _handleSingleSelectionByMouse : function(e) {
     Y.log('_handleSingleSelectionByMouse', 'info', 'plugin-row-select');
     this._unselectAllRows();
     this._anchorRow = e.rowTarget;
     this._selectRow(e.rowTarget);
  },

  /**
   * @description Determines the selection behavior resulting from a mouse event
   * when selection mode is set to 'standard'. This mode includes shift and ctrl
   * key press combinations along with a mouse click.
   *
   * @method _handleStandardSelectionByMouse
   * @param e.rowTarget {HTMLElement} Target row element. A <tr> node in the <tbody>.
   * @param e.shiftKey {Boolean} If the shift key was pressed.
   * @param e.ctrlKey {Boolean} If the ctrl key was pressed.
   * @param e.metaKey {Boolean} If the meta key was pressed (Command key on a Mac).
   * @private
   */
  _handleStandardSelectionByMouse : function(e) {
    Y.log('_handleStandardSelectionByMouse', 'info', 'plugin-row-select');

    var bSHIFT = e.shiftKey,
        bCTRL = e.ctrlKey || (Y.UA.webkit && e.metaKey), // For Safari on a Mac.
        row = e.rowTarget,
        i, anchorRowIndex, targetRowIndex,
        tbodyRows = this._host._tbodyNode.all('tr');

    if (bSHIFT && bCTRL) {
       // Both SHIFT and CTRL were pressed.

       // Validate the anchor row.
       if (this._anchorRow) {

          anchorRowIndex = this._getTrEl(this._anchorRow).sectionRowIndex;
          targetRowIndex = this._getTrEl(row).sectionRowIndex;

          if (this._isSelected(this._anchorRow)) {
             if (anchorRowIndex < targetRowIndex) {
                // Select all rows between the anchor row and the target row, including
                // the target row.
                for (i = anchorRowIndex + 1; i <= targetRowIndex; i++) {
                   this._selectRowIfNotSelected(tbodyRows.item(i));
                }
             } else {
                // Select all rows between the target row and the anchor row, including
                // the target row.
                for (i = anchorRowIndex - 1; i >= targetRowIndex; i--) {
                   this._selectRowIfNotSelected(tbodyRows.item(i));
                }
             }
          } else {
             if (anchorRowIndex < targetRowIndex) {
                // Unselect all rows between the anchor row and the target row.
                for (i = anchorRowIndex + 1; i <= targetRowIndex - 1; i++) {
                   this._unselectRowIfSelected(tbodyRows.item(i));
                }
             } else {
                // Unselect all rows between the target row and the anchor row.
                for (i = targetRowIndex + 1; i <= anchorRowIndex - 1; i++) {
                   this._unselectRowIfSelected(tbodyRows.item(i));
                }
             }
             // Select the target row.
             this._selectRow(row);
          }

       } else {
          // Invalid anchor. Set the anchor row.
          this._anchorRow = row;

          // Toggle selection of the target row.
          this._toggleSelectionOfRow(row);
       }

    } else if (bSHIFT) {
       // Only the SHIFT key was pressed.

       this._unselectAllRows();

       // Validate the anchor row.
       if (this._anchorRow) {

             anchorRowIndex = this._getTrEl(this._anchorRow).sectionRowIndex;
             targetRowIndex = this._getTrEl(row).sectionRowIndex;

         if (anchorRowIndex < targetRowIndex) {
            // Select all rows between the anchor row and the target row, including
            // both the anchor row and the target row.
            for (i = anchorRowIndex; i <= targetRowIndex; i++) {
               this._selectRow(tbodyRows.item(i));
            }
         } else {
            // Select all rows between the target row and the anchor row, including
            // both the target row and the anchor row.
            for (i = anchorRowIndex; i >= targetRowIndex; i--) {
               this._selectRow(tbodyRows.item(i));
            }
         }

       } else {
         // Invalid anchor. Set the anchor row.
         this._anchorRow = row;

         // Select the target row only.
         this._selectRow(row);
       }

    } else if (bCTRL) {
       // Only the CTRL key was pressed.

       // Set the anchor row.
       this._anchorRow = row;

       // Toggle selection of the target row.
       this._toggleSelectionOfRow(row);
    } else {
       // Neither the SHIFT key nor the CTRL key were pressed. Default to
       // 'single' row selection mode.
       this._handleSingleSelectionByMouse(e);
    }
  },

  /**
   * @description Selects the row if it's not already selected.
   * @method _selectRowIfNotSelected
   * @param row {Node} The target row to be selected.
   * @private
   */
  _selectRowIfNotSelected : function(row) {
     Y.log('_selectRowIfNotSelected', 'info', 'plugin-row-select');
     if (!this._isSelected(row)) {
        this._selectRow(row);
     }
  },

  /**
   * @description Unselects the row if it's been selected.
   * @method _unselectRowIfSelected
   * @param row {Node} The target row to be unselected.
   * @private
   */
  _unselectRowIfSelected : function(row) {
     Y.log('_unselectRowIfSelected', 'info', 'plugin-row-select');
     if (this._isSelected(row)) {
        this._unselectRow(row);
     }
  },

  /**
   * @description Toggles the selection of the row.
   * @method _toggleSelectionOfRow
   * @param row {Node} The row whose selection is being toggled.
   * @private
   */
  _toggleSelectionOfRow : function(row) {
     Y.log('_toggleSelectionOfRow', 'info', 'plugin-row-select');
     if (this._isSelected(row)) {
        this._unselectRow(row);
     } else {
        this._selectRow(row);
     }
  },

  /**
   * @description Unselect all currently selected rows.
   * @method _unselectAllRows
   * @private
   */
  _unselectAllRows : function() {
     Y.log('_unselectAllRows', 'info', 'plugin-row-select');
     var tbody = this._host._tbodyNode;

     // Find selected rows by presence of the selected class on each <tr>
     // in the <tbody> of the <table>.
     tbody.all('tr' + '.' + CLASS_SELECTED).each(function(row) {
        this._unselectRow(row);
     }, this);

    // Make sure that the array of selected rows is empty.
    if (this.get(SELECTED_ROWS).size() !== 0) {
        this.set(SELECTED_ROWS, new Y.ArrayList());
    }
  },

  /**
   * @description Select the specified row.
   * @method _selectRow
   * @param row {HTMLElement} The target row. A <tr> node in the <tbody>.
   * @private
   */
  _selectRow : function(row) {
     Y.log('_selectRow', 'info', 'plugin-row-select');
     if (!this._anchorRow) {
        this._anchorRow = row; // Set the anchor row if none has been selected yet.
     }
     row.addClass(CLASS_SELECTED);
     this.get(SELECTED_ROWS).add(row);
  },

  /**
   * @description Unselect the specified row.
   * @method _unselectRow
   * @param row {HTMLElement} The target row. A <tr> node in the <tbody>.
   * @private
   */
  _unselectRow : function(row) {
     Y.log('_unselectRow', 'info', 'plugin-row-select');
     row.removeClass(CLASS_SELECTED);
     this.get(SELECTED_ROWS).remove(row);
  },

  /**
   * @description Determines if the specified row has been selected.
   * @method
   * @param row {HTMLElement} The target row. A <tr> node in the <tbody>.
   * @return {Boolean} True if the row has been selected. False otherwise.
   * @private
   */
  _isSelected : function(row) {
     Y.log('_isSelected', 'info', 'plugin-row-select');
     return row.hasClass(CLASS_SELECTED);
  },

  /**
   * @description Retrieves the <tr> element corresponding to the specified row from
   * the document. Required to obtain the .sectionRowIndex property of the row.
   *
   * @method
   * @param row {HTMLElement} The target row. A <tr> node in the <tbody>.
   * @return {HTMLElement} The <tr> node in the document corresponding to the specified
   * target row.
   */
  _getTrEl : function(row) {
     Y.log('_getTrEl', 'info', 'plugin-row-select');
     return document.getElementById(row.get('id'));
  }

});

Y.namespace("Plugin").DataTableRowSelect = DataTableRowSelect;



}, '@VERSION@' ,{requires:['datatable-base','plugin','node','event','event-delegate','arraylist','arraylist-add']});
