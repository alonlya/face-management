import $ from 'jquery';

const url = '/api/face_database';

$('form').submit((event) => {
  event.preventDefault();

  const name = $('#name').val() as string;
  const group = $('#group').val() as string;
  const page = parseInt($('#page').val() as string);
  const limit = parseInt($('#limit').val() as string);

  const queryParams: any = {
    page: page,
    limit: limit,
  };

  if (name) {
    queryParams.name = name;
  }

  if (group) {
    queryParams.group = group;
  }

  $.get(url, queryParams, (response) => {
    const results = response.data.data;

    $('#results').empty();

    for (const result of results) {
      const html = `
        <tr>
          <td>${result.id}</td>
          <td>${result.name}</td>
          <td>${result.group}</td>
          <td>${result.created_time}</td>
          <td>${result.updated_time}</td>
          <td>${result.is_deleted ? '是' : '否'}</td>
          <td><img src="data:image/png;base64,${result.face_base64}" /></td>
        </tr>
      `;
      $('#results').append(html);
    }
  });
});
