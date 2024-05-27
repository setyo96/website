$(document).ready(function() {
    const login = function() {
        $('.btn-jwt').on('click', function() {
            var $this = $(this);
            var server = $this.data('server');
            
            var $loadingOverlay = $('<div class="loading-overlay"></div>'); 
            var $loadingSpinner = $('<div class="loading-spinner"></div>'); 
            
            $loadingOverlay.append($loadingSpinner);
            
            $('body').append($loadingOverlay);
        
            $.ajax({
                url: 'http://localhost:3000/api/v1/login', 
                method: 'POST', 
                data: JSON.stringify({ base_url: server}),
                contentType: 'application/json',
                success: function(response) {
                    $loadingOverlay.remove();
                    console.log(response)
                },
                error: function(xhr, status, error) {
                    $loadingOverlay.remove();
                }
            });
        });
    }

    const runAll = function() {
        $('.btn-all').on('click', function() {
            var $this = $(this);
            var command = $this.data('sprint');
            var serv = $this.data('server');
            $this.text('Running').prop('disabled', true).addClass('running');

            var endpointUrl = `http://localhost:3000/api/v1/run/all`;
            $.ajax({
                url: endpointUrl,
                method: 'POST',
                data: JSON.stringify(
                    { 
                        command: command,
                        base_url:serv
                    }
                ),
                contentType: 'application/json',
                success: function(response) {
                    var result = response.data.result;
                    var resultClass = result === 'success' ? 'pass-all' : 'fail-all';
                    var resultText = result === 'success' ? 'PASS' : 'FAILED';
                    var logFileUrl = `http://localhost:3000/api/v1/logs/all?name=`+ command;

                    var resultLink = $('<a>')
                        .attr('href', logFileUrl)
                        .attr('target', '_blank')
                        .text(resultText)

                    $('.btn-all-output').removeClass('pass-all fail-all').empty().addClass(resultClass).append(resultLink);
                    $this.text('Retry').prop('disabled', false).removeClass('running');
                },
                error: function() {
                    console.log('Error occurred while running the test');
                    $this.text('Retry').prop('disabled', false).removeClass('running');
                    $('.btn-all-output').removeClass('pass-all fail-all').addClass('fail-all').text('FAILED');
                }
            });
        });
    }

    const getData = function(val_sprint) {
        const sprint = val_sprint
        $.ajax({
            url: 'http://localhost:3000/api/v1/list/endpoints',
            method: 'GET',
            data: {
                sprint: sprint
            },
            success: function(data) {
                var table = $('<table class="table-container">');
                var headerRow = $('<tr>');
                headerRow.append('<th class="method-column">Method</th>');
                headerRow.append('<th style="text-align: center; font-family: sans-serif;">Path</th>');
                headerRow.append('<th class="action-column">Actions</th>');
                headerRow.append('<th class="result-column">Result</th>');
                table.append(headerRow);
                
                var title = data.data.title

                $('.title').append(title);
                
                data.data.list.forEach(function(endpoint) {
                    var method = endpoint.method.toUpperCase();
                    var path = endpoint.path;
                    var title = endpoint.title
                    var slug = endpoint.slug
                    
                    var row = $('<tr>');
                    row.append('<td class="method-column method-' + method.toLowerCase() + '">' + method + '</td>');
                    row.append('<td class="path-column">' + path + '&nbsp;&nbsp;<span class="title-font">' + title + '</span></td>');
                    
                    var actionCell = $('<td class="action-column">');
                    var runBtn = $('<button class="btn run-btn" data-sprint="' +sprint+ '" data-slug="' +slug+ '">Run</button>');
                    actionCell.append(runBtn);
                    row.append(actionCell);

                    var resultCell = $('<td class="result-column"><div class="output-status"></div></td>');
                    row.append(resultCell);

                    table.append(row);
                });

                $('.output').append(table);

                $('.run-btn').on('click', function() {
                    var $this = $(this);
                    var command = $this.data('sprint');
                    var slug = $this.data('slug');
                    var base_url = $this.data('server')
                    $this.text('Running').prop('disabled', true).addClass('running');

                    var endpointUrl = `http://localhost:3000/api/v1/run/single`;
                    $.ajax({
                        url: endpointUrl,
                        method: 'POST',
                        data: JSON.stringify(
                            { 
                                command: command,
                                slug: slug,
                                base_url: base_url
                            }),
                        contentType: 'application/json',
                        success: function(response) {
                            var result = response.data.result;
                            var resultClass = result === 'success' ? 'pass' : 'fail';
                            var resultText = result === 'success' ? 'PASS' : 'FAILED';
                            var logFileUrl = `http://localhost:3000/api/specmatic/logs?name=`+ command;

                            var resultLink = $('<a>')
                                .attr('href', logFileUrl)
                                .attr('target', '_blank')
                                .text(resultText)

                            $this.closest('tr').find('.output-status').removeClass('pass fail').empty().addClass(resultClass).append(resultLink);
                            $this.text('Retry').prop('disabled', false).removeClass('running');
                        },
                        error: function() {
                            console.log('Error occurred while running the test');
                            $this.text('Retry').prop('disabled', false).removeClass('running');
                            $this.closest('tr').find('.output-status').removeClass('pass fail').addClass('fail').text('FAILED');
                        }
                    });
                });
            },
            error: function() {
                console.log('Error fetching endpoints for service: ' + service);
            }
        });

        $.ajax({
            url: 'http://localhost:3000/api/v1/list/servers',
            method: 'GET',
            data: {
                sprint: sprint
            },
            success: function(response) {
                const sprintDropdown = $('.server-select');
                sprintDropdown.empty();
                response.data.server_list.forEach(function(server) {
                    var desc = server.description
                    var serv = server.url
                    
                    sprintDropdown.append('<option value="' + serv + '">' + serv + ' - ' + desc + '</option>');
                });

                $('.btn-jwt').remove();
                var loginBtn = $('<button class="btn-jwt" data-server="' + response.data.server_list[0].url + '"><img src="login.png" alt="JWT Token"></button>')
                $('.sprint-filter').append(loginBtn)

                $('.btn-all').remove();
                $('.btn-all-output').remove();
                var runAllBtn = $('<button class="btn-all" data-sprint="' +sprint+ '" data-server="' + response.data.server_list[0].url + '">Run All</button>');
                var outputPlaceholder = $('<div class="btn-all-output"></div>');
                $('.sprint-filter').append(runAllBtn).append(outputPlaceholder);

                $(".run-btn").attr("data-server", response.data.server_list[0].url);

                $('.server-select').on('change', function() {
                    var selectedServer = $(this).val();

                    $('.btn-jwt').remove();
                    var loginBtn = $('<button class="btn-jwt" data-server="' + selectedServer + '"><img src="login.png" alt="JWT Token"></button>')
                    $('.sprint-filter .btn-all-output').before(loginBtn)
                    login()

                    $('.btn-all').remove();
                    var runAllBtn = $('<button class="btn-all" data-sprint="' +sprint+ '" data-server="' + selectedServer + '">Run All</button>');
                    $('.sprint-filter .btn-all-output').before(runAllBtn);
                    runAll()

                    $(".run-btn").removeAttr("data-server").attr("data-server", selectedServer);
                });

                login()
                runAll()
            },
            error: function() {
                console.log('Error fetching endpoints for service: ' + service);
            }
        })
    }

    $.ajax({
        url: 'http://localhost:3000/api/v1/list/sprints',
        method: 'GET',
        success: function(response) {
            const sprintDropdown = $('.sprint-select');
            sprintDropdown.empty();
            response.data.forEach(function(sprint) {
                sprintDropdown.append('<option value="' + sprint + '">' + sprint + '</option>');
            });

            getData(response.data[0])

            $('.sprint-select').on('change', function() {
                var selectedSprint = $(this).val();
                
                $('.title').empty();
                $('.output').empty(); 
                getData( selectedSprint); 
            });
        },
        error: function() {
            console.log('Error fetching services');
        }
    });
});


