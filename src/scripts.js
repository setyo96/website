$(document).ready(function() {
    const login = function(val_url) {
        $('.btn-jwt').on('click', function() {
            var $this = $(this);
            var dataValue = val_url
            console.log(dataValue)
            // var $loadingOverlay = $('<div class="loading-overlay"></div>'); 
            // var $loadingSpinner = $('<div class="loading-spinner"></div>'); 
            
            // $loadingOverlay.append($loadingSpinner);
            
            // $('body').append($loadingOverlay);
        
            // $.ajax({
            //     url: 'http://localhost:3000/api/v1/login', 
            //     method: 'POST', 
            //     // data: {
            //     //     sprint: sprint
            //     // },
            //     success: function(response) {
            //         $loadingOverlay.remove();
            //     },
            //     error: function(xhr, status, error) {
            //         $loadingOverlay.remove();
            //     }
            // });
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
                    
                    var row = $('<tr>');
                    row.append('<td class="method-column method-' + method.toLowerCase() + '">' + method + '</td>');
                    row.append('<td class="path-column">' + path + '&nbsp;&nbsp;<span class="title-font">' + title + '</span></td>');
                    
                    var actionCell = $('<td class="action-column">');
                    var runBtn = $('<button class="btn run-btn" data-sprint="' +sprint+ '">Run</button>');
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
                    $this.text('Running').prop('disabled', true).addClass('running');

                    var endpointUrl = `http://localhost:3000/api/v1/run`;
                    $.ajax({
                        url: endpointUrl,
                        method: 'POST',
                        data: JSON.stringify({ command: command}),
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
                
                login(response.data.server_list[0].url)

                $('.server-select').on('change', function() {
                    var selectedServer = $(this).val();
                    console.log(selectedServer)
                    // login(selectedServer)
                });
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
                console.log(selectedSprint);
                
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


