var hasValidTigoSystemLayout = true;

function updateTigoAfterDeviceChanged() {
	if(currentBindTigoInfo) {
		loadSystemLayout();
	} else {
		hasValidTigoSystemLayout = false;
		$('#microPanelContainer').hide();
	}
}

function loadSystemLayout() {
	if(currentSerialNum) {
		$.post(baseUrl + '/api/tigo/getSystemLayout', { serialNum: currentSerialNum }, function(response) {
			if(response.success) {
				for(var i = response.yCount + 1; i <= 10; i++) {
					$('#microPanelContainer .microPanelRow[row=' + i + ']').hide();
				}
				
				$.each(response.rows, function(index, element) {
					$('#' + element.layoutKey).attr('title', element.label).addClass('id_' + element.id).removeClass('inactive').addClass('active')
						.find('.labelSpan1').text(element.label);
				});
				
				$('#microPanelContainer').fadeIn();
				
				hasValidTigoSystemLayout = true;
				
				refreshTigoDataIfSystemLayoutValid();
				
				refreshAlertsIfSystemLayoutValid();
			}
		}, 'json');
	}
}

function refreshAlertsIfSystemLayoutValid() {
	$('#tigoAlertComponent').empty().hide();
	
	if(hasValidTigoSystemLayout) {
		$.post(baseUrl + '/api/tigo/getAlerts', { serialNum: currentSerialNum }, function(response) {
			if(response.success) {
				if(response.count > 0) {
					$.each(response.rows, function(index, element) {
						$('#tigoAlertComponent').append('<p class="alertTitle">' + element.generated + ' - ' + element.title + '</p>');
					});
					$('#tigoAlertComponent').fadeIn();
				}
			}
		}, 'json');
	}
}

function refreshTigoDataIfSystemLayoutValid() {
	if(hasValidTigoSystemLayout) {
		refreshTigoDataIfSystemByParam('Pin');
		refreshTigoDataIfSystemByParam('Vin');
		refreshTigoDataIfSystemByParam('Iin');
//		refreshTigoDataIfSystemByParam('Pin', 'day');
	}
}

function refreshTigoDataIfSystemByParam(tigoParam, level) {
	var params = { serialNum: currentSerialNum, tigoParam: tigoParam };
	if(level) {
		params['level'] = level;
	}
	
	$.post(baseUrl + '/api/tigo/getData', params, function(response) {
		if(response.success) {
			$.each(response.rows, function(index, element) {
				if(tigoParam == 'Pin') {
					if(level && level == 'day') {
						$('.id_' + element.id + ' .energySpan').text(element.value + ' Wh');
					} else {
						$('.id_' + element.id + ' .labelSpan2').text(element.value + ' W');
					}
				} else if(tigoParam == 'Vin') {
					$('.id_' + element.id + ' .voltageSpan').text(element.value + ' V');
				} else if(tigoParam == 'Iin') {
					$('.id_' + element.id + ' .currentSpan').text(element.value + ' A');
				}
			});
			
			if(tigoParam == 'Pin') {
				if(response.lastDataTime) {
					$('#tigoLocalTimeLabel').text(response.lastDataTime);
				} else {
					$('#tigoLocalTimeLabel').text('');
				}
				
				if(response.dataUpdateTimeText) {
					$('#tigoDataUpdateTimeText').text(response.dataUpdateTimeText);
					$('#tigoDataUpdateTimeTextLabel').fadeIn();
				} else {
					$('#tigoDataUpdateTimeText').text('');
					$('#tigoDataUpdateTimeTextLabel').hide();
				}
			}
		}
	}, 'json');
}
