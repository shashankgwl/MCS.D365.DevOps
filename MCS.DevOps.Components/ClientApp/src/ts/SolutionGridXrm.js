"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var MCS;
(function (MCS) {
    var DevOps;
    (function (DevOps) {
        var Web;
        (function (Web) {
            var solORders = new Array();
            function retrieveSolutionDeploymentOrder(recordId, exportmanaged) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, new Promise((function (resolve) {
                                var expand = "?$select=devops_deploymentorder,_devops_solution_value&$expand=devops_solution($select=devops_name,devops_solutionguid,devops_solutionid,devops_solutionuniquename,devops_version)&$orderby=devops_deploymentorder asc&$filter=_devops_solutiondeploymentorder_value eq " + recordId;
                                window.Xrm.WebApi.online.retrieveMultipleRecords("devops_solutiondeploymentorder", expand).then(function success(results) {
                                    resolve(results);
                                }, function (error) {
                                    window.Xrm.Utility.alertDialog(error.message, function () { });
                                });
                            })).then(function (solutionOrders) {
                                solutionOrders.entities.forEach(function (item, index) {
                                    solORders.push([item.devops_deploymentorder, item.devops_solution.devops_solutionuniquename, 'Not Started']);
                                });
                                return solORders.sort(function (item1, item2) { return item1.devops_deploymentorder - item2.devops_deploymentorder; });
                            })];
                    });
                });
            }
            Web.retrieveSolutionDeploymentOrder = retrieveSolutionDeploymentOrder;
            function createSolutionRecord(solutionData) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        solutionData.map(function (solution) {
                            var devopsSol = {
                                devops_name: solution.friendlyname,
                                devops_solutionuniquename: solution.uniquename,
                                devops_version: solution.version
                            };
                            window.parent.Xrm.WebApi.online.createRecord("devops_solution", devopsSol).then(function success(result) {
                                var newEntityId = result.id;
                            }, function (error) {
                            });
                        });
                        return [2 /*return*/];
                    });
                });
            }
            Web.createSolutionRecord = createSolutionRecord;
            function getUnmanagedSolutions() {
                return __awaiter(this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        debugger;
                        return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                                var result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, window.parent.Xrm.WebApi.online.retrieveMultipleRecords("solution", "?$select=solutionid,friendlyname,ismanaged,uniquename,version&$filter=ismanaged eq false")];
                                        case 1:
                                            result = _a.sent();
                                            resolve(result.entities);
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    });
                });
            }
            Web.getUnmanagedSolutions = getUnmanagedSolutions;
            function createExportStatusRecord(filename, exportStatus) {
                return __awaiter(this, void 0, void 0, function () {
                    var entity, exportStatusRecord;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                entity = {};
                                entity.devops_name = filename;
                                entity.devops_status = exportStatus;
                                entity["devops_Deployment@odata.bind"] = "/devops_deployments(" + localStorage.getItem("recid") + ")";
                                return [4 /*yield*/, window.Xrm.WebApi.createRecord('devops_exportstatus', entity)];
                            case 1:
                                exportStatusRecord = _a.sent();
                                return [2 /*return*/, exportStatusRecord.id];
                        }
                    });
                });
            }
            Web.createExportStatusRecord = createExportStatusRecord;
            function createAnnotationRecord(fileBase64, filename) {
                return __awaiter(this, void 0, void 0, function () {
                    var exportStatusRecordId, entity;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                window.Xrm.Utility.showProgressIndicator("Creating export status record for " + filename);
                                return [4 /*yield*/, createExportStatusRecord(filename, "Completed")];
                            case 1:
                                exportStatusRecordId = _a.sent();
                                entity = {};
                                entity.filename = filename;
                                entity["objectid_devops_exportstatus@odata.bind"] = "/devops_exportstatuses(" + exportStatusRecordId + ")";
                                entity.subject = filename;
                                entity.mimetype = "application/zip";
                                entity.documentbody = fileBase64;
                                return [2 /*return*/, window.Xrm.WebApi.online.createRecord("annotation", entity)];
                        }
                    });
                });
            }
            Web.createAnnotationRecord = createAnnotationRecord;
            function beginExportSolution() {
                return __awaiter(this, void 0, void 0, function () {
                    var decoder, i, response, body, stream, reader, data, newread, fileBase64, e_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 10, 11, 12]);
                                decoder = new TextDecoder();
                                debugger;
                                i = 0;
                                _a.label = 1;
                            case 1:
                                if (!(i < solORders.length)) return [3 /*break*/, 9];
                                console.log("Now processing " + solORders[i][1]);
                                window.Xrm.Utility.showProgressIndicator("Now processing " + solORders[i][1]);
                                return [4 /*yield*/, exportSolutionSingle(solORders[i][1])];
                            case 2:
                                response = _a.sent();
                                body = response.body;
                                stream = body;
                                return [4 /*yield*/, stream.getReader()];
                            case 3:
                                reader = _a.sent();
                                data = '';
                                _a.label = 4;
                            case 4:
                                if (!true) return [3 /*break*/, 6];
                                return [4 /*yield*/, reader.read()];
                            case 5:
                                newread = _a.sent();
                                data += decoder.decode(newread.value);
                                if (newread.done) {
                                    return [3 /*break*/, 6];
                                }
                                return [3 /*break*/, 4];
                            case 6:
                                fileBase64 = JSON.parse(data).ExportSolutionFile;
                                localStorage.getItem("exportmanaged");
                                return [4 /*yield*/, createAnnotationRecord(fileBase64, solORders[i][1] + '.zip')];
                            case 7:
                                _a.sent();
                                window.Xrm.Utility.showProgressIndicator("Attachment created for " + solORders[i][1]);
                                _a.label = 8;
                            case 8:
                                i++;
                                return [3 /*break*/, 1];
                            case 9:
                                window.Xrm.Utility.showProgressIndicator("Export completed. This window will close now.");
                                solORders.splice(0, solORders.length);
                                setTimeout(function () {
                                    window.Xrm.Utility.closeProgressIndicator();
                                }, 2000);
                                return [3 /*break*/, 12];
                            case 10:
                                e_1 = _a.sent();
                                window.Xrm.Utility.alertDialog(e_1.message, function () { });
                                window.Xrm.Utility.closeProgressIndicator();
                                return [3 /*break*/, 12];
                            case 11: return [7 /*endfinally*/];
                            case 12: return [2 /*return*/];
                        }
                    });
                });
            }
            Web.beginExportSolution = beginExportSolution;
            function exportSolutionSingle(solutionName) {
                var parameters = {};
                var exportmanaged = localStorage.getItem("exportmanaged");
                console.log("Called");
                parameters.SolutionName = solutionName;
                parameters.Managed = exportmanaged;
                var exportSolutionRequest = {
                    SolutionName: parameters.SolutionName,
                    Managed: parameters.Managed,
                    getMetadata: function () {
                        return {
                            boundParameter: null,
                            parameterTypes: {
                                "SolutionName": {
                                    "typeName": "Edm.String",
                                    "structuralProperty": 1
                                },
                                "Managed": {
                                    "typeName": "Edm.Boolean",
                                    "structuralProperty": 1
                                }
                            },
                            operationType: 0,
                            operationName: "ExportSolution"
                        };
                    }
                };
                return window.Xrm.WebApi.online.execute(exportSolutionRequest);
                ////Xrm.Utility.confirmDialog("This action will start exporting solutions based on the order defined in solution deployment order, do you want to continue?", () => { }, () => { });
            }
            Web.exportSolutionSingle = exportSolutionSingle;
        })(Web = DevOps.Web || (DevOps.Web = {}));
    })(DevOps = MCS.DevOps || (MCS.DevOps = {}));
})(MCS || (MCS = {}));
exports["default"] = MCS.DevOps.Web;
