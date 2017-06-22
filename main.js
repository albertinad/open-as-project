/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Intel Corporation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
    function _cmdOpen() {
        _isCmdAction = true;

        var item = ProjectManager.getSelectedItem(),
            project = ProjectManager.getProjectRoot(),
            path;

        if (item) {
            if (item.isDirectory) {
                path = item.fullPath;
            } else if (item.parentPath !== project.fullPath) {
                path = item.parentPath;
            }

            // add current project path to stack and update back command if needed
            _openNewProjectIfNeeded(project, path);
        }
    }

    /**
    *  @private
    */
    function _openNewProjectIfNeeded(currentProject, newPath) {
        if (currentProject && newPath) {
            _addProjectToStack(currentProject);
            ProjectManager.openProject(newPath);
        }
    }

    /**
     * @private
     */
    function _addProjectToStack(project) {
        if (project) {
            _pathStack.push(project.fullPath);
            _toggleBackCmdIfNeeded();
        }
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
