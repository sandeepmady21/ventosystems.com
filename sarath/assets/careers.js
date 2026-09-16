/*
 * careers.js — the only script on this website.
 *
 * It runs on the Careers page, and only when someone presses the button on the
 * application form. It sends nothing anywhere. It gathers the answers from the
 * form and opens the applicant's own email app with a message to the firm
 * already written out, one line per answer. The applicant checks it and presses
 * Send in their email app.
 *
 * Why it exists: the firm wanted applications to arrive as plain text, without
 * a CV attached, and without the website needing a server to send them. This is
 * the simplest way to do that.
 *
 * You should not need to edit this file. To change a question, edit careers.html:
 * the text of the <label> is what the applicant sees, and the data-label on the
 * field is the wording used in the email the firm receives.
 *
 * If JavaScript is switched off, the form still opens the email app, but the
 * message is less tidy. The page also gives the email address to write to.
 */
(function () {
  'use strict';

  var form = document.getElementById('application');
  if (!form) {
    return;
  }

  var status = document.getElementById('application-status');

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];

  /* "2026-11" from a month field reads better in an email as "November 2026". */
  function formatMonth(value) {
    var parts = value.split('-');
    var index = parseInt(parts[1], 10) - 1;
    return (MONTHS[index] || parts[1]) + ' ' + parts[0];
  }

  form.addEventListener('submit', function (event) {
    /* By the time this runs the browser has already checked the required
       fields, so every required answer is present. */
    event.preventDefault();

    var lines = [];
    var answeredRadioGroups = {};
    var fields = form.querySelectorAll('[data-label]');

    for (var i = 0; i < fields.length; i += 1) {
      var field = fields[i];
      var label = field.getAttribute('data-label');
      var value;

      if (field.type === 'radio') {
        if (!field.checked || answeredRadioGroups[field.name]) {
          continue;
        }
        answeredRadioGroups[field.name] = true;
        value = field.value;
      } else {
        value = field.value.trim();
      }

      if (field.type === 'month' && value) {
        value = formatMonth(value);
      }

      /* Optional questions left blank are left out of the email. */
      if (value) {
        lines.push(label + ': ' + value);
      }
    }

    var chosen = form.querySelector('input[name="applying-for"]:checked');
    var name = document.getElementById('name').value.trim();
    var kind = chosen && chosen.value === 'Articleship'
      ? 'Articleship application'
      : 'Position application';

    var href = 'mailto:' + form.getAttribute('data-to') +
      '?subject=' + encodeURIComponent(kind + ': ' + name) +
      '&body=' + encodeURIComponent(lines.join('\n'));

    window.location.href = href;

    /* Tell the applicant what happens next, because nothing on this page
       changes when their email app opens. */
    if (status) {
      status.hidden = false;
    }
  });
}());
