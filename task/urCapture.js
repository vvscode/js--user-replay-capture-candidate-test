(function() {
  var rootNode = document.body;
  var config = { attributes: true, childList: true, subtree: true };

  var handlers = {
    add: [],
    remove: []
  };

  var observer = new MutationObserver(mutationObserverCb);
  observer.observe(rootNode, config);

  /**
   * Main observer handler
   * @param {*} mutationsList
   */
  function mutationObserverCb(mutationsList) {
    mutationsList.forEach(function(mutationsRecord) {
      applyHandlersToNodeList(mutationsRecord.addedNodes, handlers.add);
      applyHandlersToNodeList(mutationsRecord.removedNodes, handlers.remove);
    });
  }

  /**
   * Add `add`-event handler
   * @param {String} selector
   * @param {Function} cb
   * @returns {Function} which allow to disable handler
   */
  function watchForAddedElements(selector, cb) {
    return addHandler(handlers, "add", { selector: selector, cb: cb });
  }

  /**
   * Add `remove`-event handler
   * @param {String} selector
   * @param {Function} cb
   * @returns {Function} which allow to disable handler
   */
  function watchForRemovedElements(selector, cb) {
    return addHandler(handlers, "remove", { selector: selector, cb: cb });
  }

  /**
   * Utils
   */
  // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType#Node_type_constants
  var ELEMENT_NODE_TYPE = 1;
  /**
   * Checks if node is element
   * @param {*} node
   * @returns boolean
   */
  function isElement(node) {
    if (!node) {
      return false;
    }
    if (
      node.nodeType === ELEMENT_NODE_TYPE &&
      typeof node.matches === "function"
    ) {
      return true;
    }
    return false;
  }

  /**
   *  Add handler to handlers storage
   * @param {Object} handlersObject - object with stores lists of handlers
   * @param {"add"|"remove"} handlerTypeName - type of action
   * @param  {{cb: Function, selector: string}} handler
   * @returns void
   */
  function addHandler(handlersObject, handlerTypeName, handler) {
    handlersObject[handlerTypeName].push(handler);
    return function removeHandler() {
      handlersObject[handlerTypeName] = handlersObject[handlerTypeName].filter(
        function(handler) {
          return handler !== handler;
        }
      );
    };
  }

  /**
   * Process elements from nodeList with corresponded handlers from handlers list
   * @param {NodeList} nodeList - List of nodes to apply handlers
   * @param {Array<{cb: Function, selector: string}>} handlersList - List of handlers to apply to nodes list
   * @returns void
   */
  function applyHandlersToNodeList(nodeList, handlersList) {
    for (var i = 0; i < nodeList.length; i++) {
      var node = nodeList[i];
      if (!isElement(node)) {
        continue;
      }
      handlersList.forEach(function(handler) {
        if (node.matches(handler.selector)) {
          handler.cb.call(node);
        }
      });
    }
  }

  /**
   * Public interface
   */
  window.urCapture = window.urCapture || {};
  window.urCapture.watchForAddedElements =
    window.urCapture.watchForAddedElements || watchForAddedElements;
  window.urCapture.watchForRemovedElements =
    window.urCapture.watchForRemovedElements || watchForRemovedElements;
})();
