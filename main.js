/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, browser: true */
/*global define, brackets */

define(function (require, exports, module) {
    "use strict";

    var CommandManager = brackets.getModule("command/CommandManager"),
        Menus          = brackets.getModule("command/Menus"),
        ProjectManager = brackets.getModule("project/ProjectManager"),
        Strings        = require("strings");

    var EXTENSION_NAME = "albertinad.open-as-project",
        Cmd = {
            OPEN: EXTENSION_NAME + ".open",
            BACK: EXTENSION_NAME + ".back"
        };

    var _pathStack = [],
        _isCmdAction = false,
        _backCmd;

    /**
     * @private
     */
    function _toggleBackCmdIfNeeded() {
        _backCmd.setEnabled((_pathStack.length > 0));
    }

    /**
     * @private
     */
    function _openSelectedDir() {
        var item = ProjectManager.getSelectedItem(),
            path;

        // get the cwd according to selection
        if (item.isDirectory) {
            path = item.fullPath;
        } else {
            path = item.parentPath;
        }

        ProjectManager.openProject(path);
    }

    /**
     * @private
     */
    function _cmdOpen() {
        _isCmdAction = true;
        // add current project path to stack and update back command
        var project = ProjectManager.getProjectRoot();
        if (project) {
            _pathStack.push(project.fullPath);
            _toggleBackCmdIfNeeded();
        }

        _openSelectedDir();
    }

    /**
     * @private
     */
    function _cmdBack() {
        if (_pathStack.length > 0) {
            _isCmdAction = true;

            var path = _pathStack.pop();

            if (path) {
                ProjectManager.openProject(path);

                _toggleBackCmdIfNeeded();
            }
        }
    }

    function init() {
        // setup command for project tree files
        var projectMenu = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU);

        CommandManager.register(Strings.TITLE_OPEN, Cmd.OPEN, _cmdOpen);
        _backCmd = CommandManager.register(Strings.TITLE_BACK, Cmd.BACK, _cmdBack);

        projectMenu.addMenuDivider();
        projectMenu.addMenuItem(Cmd.OPEN);
        projectMenu.addMenuItem(Cmd.BACK);

        _toggleBackCmdIfNeeded();

        ProjectManager.on("projectOpen", function () {
            if (_isCmdAction) {
                _isCmdAction = false;
            } else {
                _pathStack = [];
                _toggleBackCmdIfNeeded();
            }
        });
    }

    init();
});
