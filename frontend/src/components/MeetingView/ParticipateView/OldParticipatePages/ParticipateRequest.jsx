/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';

function ParticipateRequest() {
  return (
    <div className="ParticipateContent">
      <h3 className="ParticipateHeader">
        Request Separate Consideration of a Consent Calendar Item
      </h3>

      <p>
        There will be no separate discussion of Consent Calendar items as
        they are considered to be routine by the City Council and will be
        adopted by one motion. If a member of the City Council, staff, or
        public requests discussion on a particular item, that item may be
        removed from the Consent Calendar and considered separately.
      </p>

      <p>
        If you wish to request separate discussion on a particular item
        of the consent calendar:
      </p>

      <ol>
        <li>
          <p>
            Email
            {' '}
            <a href="mailto:city.clerk@sanjoseca.gov">city.clerk@sanjoseca.gov</a>
            {' '}
            by 10:00 a.m. the day of the meeting.
          </p>
          <p className="info">
            Please identify the Consent Calendar Agenda Item Number in the
            subject line of your email.
          </p>
        </li>
      </ol>
    </div>
  );
}

export default ParticipateRequest;