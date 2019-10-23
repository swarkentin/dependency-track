/*
 * This file is part of Dependency-Track.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 * Copyright (c) Steve Springett. All Rights Reserved.
 */

"use strict";

/**
 * Called by bootstrap table to format the data in the projects table.
 */
function formatProjectsTable(res) {
    let projectsTable = $("#projectsTable");
    for (let i=0; i<res.length; i++) {
        let projecturl = "../project/?uuid=" + res[i].uuid;
        res[i].projecthref = "<a href=\"" + projecturl + "\">" + filterXSS(res[i].name) + "</a>";
        res[i].version = filterXSS(res[i].version);

        if (res[i].hasOwnProperty("lastScanImport")) {
            res[i].lastScanImportLabel = $common.formatTimestamp(res[i].lastScanImport, true);
        }

        if (res[i].hasOwnProperty("lastBomImport")) {
            res[i].lastBomImportLabel = $common.formatTimestamp(res[i].lastBomImport, true);
        }

        if (res[i].hasOwnProperty("lastBomImportFormat")) {
            res[i].lastBomImportFormatLabel = filterXSS(res[i].lastBomImportFormat);
        }

        if (res[i].hasOwnProperty("metrics")) {
            res[i].vulnerabilities = $common.generateSeverityProgressBar(res[i].metrics.critical, res[i].metrics.high, res[i].metrics.medium, res[i].metrics.low, res[i].metrics.unassigned);
        }

        if (res[i].active === true) {
            res[i].activeLabel = '<i class="fa fa-check-square-o" aria-hidden="true"></i>';
        } else {
            res[i].activeLabel = '';
        }
    }
    return res;
}

function rowStyleProjectsTable(row, index) {
    if (!row.active) {
        return {
            css: {
                background: "#f5f5f5"
            }
        }
    }
    return {};
}

function projectCreated(data) {
    $("#projectsTable").bootstrapTable("refresh", {silent: true});
}

/**
 * Clears all the input fields from the modal.
 */
function clearInputFields() {
    $("#createProjectNameInput").val("");
    $("#createProjectVersionInput").val("");
    $("#createProjectDescriptionInput").val("");
    $("#createProjectTagsInput").tagsinput("removeAll");
    $("#createProjectActiveInput").prop("checked", "checked");
}

function updateStats(metric) {
    $("#statTotalProjects").html(metric.projects);
    $("#statVulnerableProjects").html(metric.vulnerableProjects);
    $("#statTotalComponents").html(metric.components);
    $("#statVulnerableComponents").html(metric.vulnerableComponents);
    $("#statPortfolioVulnerabilities").html(metric.vulnerabilities);
    $("#statLastMeasurement").html(filterXSS($common.formatTimestamp(metric.lastOccurrence, true)));
    $("#statInheritedRiskScore").html(metric.inheritedRiskScore);
}

/**
 * Setup events and trigger other stuff when the page is loaded and ready
 */
$(document).ready(function () {
    let tag = $.getUrlVar("tag");
    if (tag) {
        $("#projectsTable").bootstrapTable("refresh", {
            url: $rest.contextPath() + URL_PROJECT + "/tag/" + encodeURIComponent(tag),
            silent: true
        });
    }

    $rest.getPortfolioCurrentMetrics(function(metrics) {
        updateStats(metrics);
    });

    // Initialize all tooltips
    $('[data-toggle="tooltip"]').tooltip();

    // Listen for if the button to create a project is clicked
    $("#createProjectCreateButton").on("click", function() {
        const name = $("#createProjectNameInput").val();
        const version = $("#createProjectVersionInput").val();
        const description = $("#createProjectDescriptionInput").val();
        const tags = $common.csvStringToObjectArray($("#createProjectTagsInput").val());
        const active = true;
        $rest.createProject(name, version, description, tags, active, projectCreated);
        clearInputFields();
    });

    // When modal closes, clear out the input fields
    $("#modalCreateProject").on("hidden.bs.modal", function() {
        $("#createProjectNameInput").val("");
    });

    $("#showInactiveProjects").change(function() {
        const url = $rest.contextPath() + URL_PROJECT + "?excludeInactive=" + !$(this).prop("checked");
        $("#projectsTable").bootstrapTable("refresh", {silent: true, url: url});
    });

});
