# Copyright (c) 2013-2018 LG Electronics, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# SPDX-License-Identifier: Apache-2.0

cmake_minimum_required(VERSION 2.8.7)
project(com.palm.service.devmode NONE) 
include(webOS/webOS)
webos_modules_init(1 0 0 QUALIFIER RC4)
webos_component(1 0 0)

set(INSTALL_DIR ${WEBOS_INSTALL_WEBOS_SERVICESDIR}/${CMAKE_PROJECT_NAME})

#install necessary files to destination directory
install(DIRECTORY . DESTINATION ${INSTALL_DIR} FILES_MATCHING PATTERN "*" PATTERN ".git" EXCLUDE
        PATTERN "BUILD*" EXCLUDE PATTERN "patches" EXCLUDE PATTERN "CMake*" EXCLUDE
        PATTERN "service" EXCLUDE PATTERN "all_tests.json" EXCLUDE PATTERN "sanity_tests.json" EXCLUDE
        PATTERN "*~" EXCLUDE PATTERN "*.in" EXCLUDE PATTERN "jslint*" EXCLUDE PATTERN ".gitignore"
        EXCLUDE PATTERN ".project" EXCLUDE PATTERN "files" EXCLUDE PATTERN "README.md" EXCLUDE )

# Install upstart files
# webos_build_daemon assumes there's a daemon of name NAME; be need a webos_build_launch_files...
#webos_build_daemon(NAME devmode)
webos_configure_source_files(upstart18File files/launch/devmode.conf)
install(PROGRAMS ${upstart18File} DESTINATION ${WEBOS_INSTALL_SYSCONFDIR}/init)

# Install ls2 service and role files
webos_build_system_bus_files()
