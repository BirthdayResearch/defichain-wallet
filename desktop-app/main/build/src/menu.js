"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var MenuBuilder = /** @class */ (function () {
    function MenuBuilder(mainWindow) {
        this.mainWindow = mainWindow;
    }
    MenuBuilder.prototype.buildMenu = function () {
        var template = process.platform === 'darwin'
            ? this.buildDarwinTemplate()
            : this.buildDefaultTemplate();
        var menu = electron_1.Menu.buildFromTemplate(template);
        electron_1.Menu.setApplicationMenu(menu);
        return menu;
    };
    MenuBuilder.prototype.buildDarwinTemplate = function () {
        var subMenuAbout = {
            label: 'About'
        };
        return [subMenuAbout];
    };
    MenuBuilder.prototype.buildDefaultTemplate = function () {
        return [
            {
                label: 'About'
            }
        ];
    };
    return MenuBuilder;
}());
exports["default"] = MenuBuilder;
//# sourceMappingURL=menu.js.map