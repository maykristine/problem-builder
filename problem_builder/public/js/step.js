function MentoringStepBlock(runtime, element) {

    var children = runtime.children(element);
    var plots = [];
    for (var i in children) {
        var child = children[i];
        var blockType = $(child.element).data('block-type');
        if (blockType === 'sb-plot') {
            plots.push(child);
        }
    }

    var submitXHR, resultsXHR,
        message = $(element).find('.sb-step-message');

    function callIfExists(obj, fn) {
        if (typeof obj !== 'undefined' && typeof obj[fn] == 'function') {
            return obj[fn].apply(obj, Array.prototype.slice.call(arguments, 2));
        } else {
            return null;
        }
    }

    return {

        initChildren: function(options) {
            for (var i=0; i < children.length; i++) {
                var child = children[i];
                callIfExists(child, 'init', options);
            }
        },

        validate: function() {
            var is_valid = true;
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child && child.name !== undefined) {
                    var child_validation = callIfExists(child, 'validate');
                    if (_.isBoolean(child_validation)) {
                        is_valid = is_valid && child_validation;
                    }
                }
            }
            return is_valid;
        },

        getSubmitData: function() {
            var data = {};
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child && child.name !== undefined) {
                    data[child.name.toString()] = callIfExists(child, "submit");
                }
            }
            return data;
        },

        showFeedback: function(response) {
            // Called when user has just submitted an answer or is reviewing their answer durign extended feedback.
            if (message.length) {
                message.fadeIn();
                $(document).click(function() {
                    message.fadeOut();
                });
            }
        },

        getResults: function(resultHandler) {
            var handler_name = 'get_results';
            var data = [];
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child && child.name !== undefined) { // Check if we are dealing with a question
                    data[i] = child.name;
                }
            }
            var handlerUrl = runtime.handlerUrl(element, handler_name);
            if (resultsXHR) {
                resultsXHR.abort();
            }
            resultsXHR = $.post(handlerUrl, JSON.stringify(data))
                .success(function(response) {
                    resultHandler(response);
                });
        },

        handleReview: function(results, options) {
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child && child.name !== undefined) { // Check if we are dealing with a question
                    var result = results[child.name];
                    callIfExists(child, 'handleSubmit', result, options);
                    callIfExists(child, 'handleReview', result);
                }
            }
        },

        getStepLabel: function() {
            return $('.sb-step', element).data('next-button-label');
        },

        hasQuestion: function() {
            return $('.sb-step', element).data('has-question')
        },

        updatePlots: function() {
            if (plots) {
                for (var i in plots) {
                    var plot = plots[i];
                    plot.update();
                }
            }
        }

    };

}
