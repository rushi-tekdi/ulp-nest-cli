// service.ts - a nestjs provider using console decorators
import { Console, Command, createSpinner } from 'nestjs-console';
import { AxiosRequestConfig } from 'axios';
import { HttpService } from '@nestjs/axios';

//generate fake words
const { faker } = require('@faker-js/faker');

@Console()
export class AppService {
  constructor(private readonly httpService: HttpService) {}
  @Command({
    command: 'ulp',
  })
  async ulpConsole(): Promise<void> {
    const moment = require('moment');
    //file stream
    const fs = require('fs');
    //read and write csv
    const csvParser = require('csv-parser');
    const { stringify } = require('csv-stringify');
    //start console
    const spin = createSpinner();
    //md5 hash
    const md5 = require('md5');

    //loading
    spin.start(`Loading Environment Variables...`);
    let ULPCLI_VERSION = null;
    let ULPCLI_NAME = null;
    let BULK_ISSUANCE_URL = null;
    let DEFAULT_PASSWORD = null;
    let CLIENT_USERNAME = null;
    let envs = await new Promise((done) =>
      setTimeout(() => {
        ULPCLI_VERSION = process.env.ULPCLI_VERSION;
        ULPCLI_NAME = process.env.ULPCLI_NAME;
        BULK_ISSUANCE_URL = process.env.BULK_ISSUANCE_URL;
        DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD;
        CLIENT_USERNAME = process.env.CLIENT_USERNAME;
        done({
          ULPCLI_VERSION: ULPCLI_VERSION,
          ULPCLI_NAME: ULPCLI_NAME,
          BULK_ISSUANCE_URL: BULK_ISSUANCE_URL,
          DEFAULT_PASSWORD: DEFAULT_PASSWORD,
          CLIENT_USERNAME: CLIENT_USERNAME,
        });
      }, 2000),
    );
    spin.succeed('Environment Variables Loaded.');
    console.log(JSON.stringify(envs, null, '\t'));

    //client token
    spin.start(`Getting Client Token...`);
    let client_response = await new Promise<any>(async (done) => {
      const data = JSON.stringify({
        username: CLIENT_USERNAME,
        password: DEFAULT_PASSWORD,
      });
      const url = BULK_ISSUANCE_URL + '/bulk/v1/clienttoken';
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      let response_data = null;
      try {
        const observable = this.httpService.post(url, data, config);
        const promise = observable.toPromise();
        const response = await promise;
        response_data = response.data;
      } catch (e) {
        response_data = { error: e };
      }
      done(response_data);
    });
    if (client_response?.error || client_response?.success === false) {
      spin.fail('Client Token Failed.');
      console.log(
        JSON.stringify(
          client_response?.error
            ? client_response.error
            : client_response?.result
            ? client_response.result
            : {},
          null,
          '\t',
        ),
      );
    } else {
      spin.succeed('Got Client Token.');
      let client_token = client_response.result;
      console.log(
        JSON.stringify(
          {
            'Client Token': client_token,
          },
          null,
          '\t',
        ),
      );

      //generate did
      spin.start(`Getting DID...`);
      let ISSUER_ID = 'school_' + Math.floor(Math.random() * 1000 + 1);
      let did_response = await new Promise<any>(async (done) => {
        const data = JSON.stringify({
          uniquetext: ISSUER_ID,
        });
        const url = BULK_ISSUANCE_URL + '/bulk/v1/getdid';
        const config: AxiosRequestConfig = {
          headers: {
            'Content-Type': 'application/json',
          },
        };
        let response_data = null;
        try {
          const observable = this.httpService.post(url, data, config);
          const promise = observable.toPromise();
          const response = await promise;
          response_data = response.data;
        } catch (e) {
          response_data = { error: e };
        }
        done(response_data);
      });
      if (did_response?.error || did_response?.success === false) {
        spin.fail('DID Failed.');
        console.log(
          JSON.stringify(
            did_response?.error
              ? did_response.error
              : did_response?.result
              ? did_response.result
              : {},
            null,
            '\t',
          ),
        );
      } else {
        spin.succeed('Got DID.');
        let ISSUER_DID = did_response.result;
        console.log(
          JSON.stringify(
            {
              DID: ISSUER_DID,
            },
            null,
            '\t',
          ),
        );

        //issuer register
        spin.start(`Getting Issuer Registered...`);
        const issuer_data = {
          name: ISSUER_ID,
          did: ISSUER_DID,
          email: ISSUER_ID + '@gmail.com',
          mobile: '9999999999',
          userid: ISSUER_ID,
        };
        const data = JSON.stringify(issuer_data);
        let issuer_invite_response = await new Promise<any>(async (done) => {
          const url = BULK_ISSUANCE_URL + '/bulk/v1/issuerregister';
          const config: AxiosRequestConfig = {
            headers: {
              Authorization: 'Bearer ' + client_token,
              'Content-Type': 'application/json',
            },
          };
          let response_data = null;
          try {
            const observable = this.httpService.post(url, data, config);
            const promise = observable.toPromise();
            const response = await promise;
            response_data = response.data;
          } catch (e) {
            response_data = { error: e };
          }
          done(response_data);
        });
        if (
          issuer_invite_response?.error ||
          issuer_invite_response?.success === false
        ) {
          spin.fail('Issuer Registration Token Failed.');
          console.log(
            JSON.stringify(
              issuer_invite_response?.error
                ? issuer_invite_response.error
                : issuer_invite_response?.result
                ? issuer_invite_response.result
                : {},
              null,
              '\t',
            ),
          );
        } else {
          spin.succeed('Issuer Registered.');
          console.log(JSON.stringify(issuer_data, null, '\t'));
          //issuer token
          spin.start(`Getting Issuer Token...`);
          let issuer_response = await new Promise<any>(async (done) => {
            const data = JSON.stringify({
              username: ISSUER_ID,
              password: DEFAULT_PASSWORD,
            });
            const url = BULK_ISSUANCE_URL + '/bulk/v1/issuertoken';
            const config: AxiosRequestConfig = {
              headers: {
                'Content-Type': 'application/json',
              },
            };
            let response_data = null;
            try {
              const observable = this.httpService.post(url, data, config);
              const promise = observable.toPromise();
              const response = await promise;
              response_data = response.data;
            } catch (e) {
              response_data = { error: e };
            }
            done(response_data);
          });
          if (issuer_response?.error || issuer_response?.success === false) {
            spin.fail('Issuer Token Failed.');
            console.log(
              JSON.stringify(
                issuer_response?.error
                  ? issuer_response.error
                  : issuer_response?.result
                  ? issuer_response.result
                  : {},
                null,
                '\t',
              ),
            );
          } else {
            spin.succeed('Got Issuer Token.');
            let issuer_token = issuer_response.result;
            console.log(
              JSON.stringify(
                {
                  'Issuer Token': issuer_token,
                },
                null,
                '\t',
              ),
            );
            //creating sample data files
            spin.start(`Creating CSV Files...`);
            let csv_files_status = await new Promise<any>(async (done) => {
              let csv_file_path = {};
              let working_dir = __dirname + '/temp/';
              const run_date_time = moment(moment().toDate()).format(
                'DD_MMM_YYYY_hh_mm_ss_a',
              );
              let enrollment_csv =
                working_dir + run_date_time + '_enrollment.csv';
              let assessment_csv =
                working_dir + run_date_time + '_assessment.csv';
              let enrollment_csv_data = [];
              let assessment_csv_data = [];

              //generate sample data
              const startDate_dob = new Date('1990-01-01');
              const endDate_dob = new Date('2005-12-31');
              const timeDiff_dob =
                endDate_dob.getTime() - startDate_dob.getTime();
              const startDate = new Date('2020-01-01');
              const endDate = new Date('2022-12-31');
              const timeDiff = endDate.getTime() - startDate.getTime();
              const grades_list = ['A+', 'A', 'B', 'C', 'D'];
              for (let i = 0; i < 10; i++) {
                let student_first_name = faker.person.firstName();
                let student_last_name = faker.person.lastName();
                let student_username_name_temp =
                  student_first_name +
                  '_' +
                  Math.floor(Math.random() * 1000 + 1);
                let student_username_name =
                  student_username_name_temp.toLowerCase();
                let student_email = student_username_name + '@gmail.com';
                let student_full_name =
                  student_first_name + ' ' + student_last_name;
                let student_id =
                  Math.floor(Math.random() * 1000 + 1) +
                  '_' +
                  student_username_name;
                let guardian_name =
                  faker.person.firstName() + ' ' + faker.person.lastName();
                let student_contact = '9999999999';
                const randomTime_dob = Math.random() * timeDiff_dob;
                const randomDate_dob = new Date(
                  startDate_dob.getTime() + randomTime_dob,
                );
                const randomDate_dob_txt = randomDate_dob
                  .toISOString()
                  .slice(0, 10);
                let student_dob = randomDate_dob_txt;
                const randomTime = Math.random() * timeDiff;
                const randomDate = new Date(startDate.getTime() + randomTime);
                const randomDate_txt = randomDate.toISOString().slice(0, 10);
                let student_enrolled_on = randomDate_txt;
                let student_aadhar_token = md5(student_id);
                let quarterlyAssessment = 3;
                let student_marks = Math.floor(Math.random() * 300 + 1);
                let marks_total = 300;
                let marks_grade =
                  grades_list[Math.floor(Math.random() * grades_list.length)];
                enrollment_csv_data.push({
                  username: student_username_name,
                  name: student_full_name,
                  email: student_email,
                  contact: student_contact,
                  student_id: student_id,
                  guardian_name: guardian_name,
                  enrolled_on: student_enrolled_on,
                  aadhar_token: student_aadhar_token,
                });
                assessment_csv_data.push({
                  username: student_username_name,
                  name: student_full_name,
                  email: student_email,
                  contact: student_contact,
                  student_id: student_id,
                  dob: student_dob,
                  quarterlyAssessment: quarterlyAssessment,
                  marks: student_marks,
                  total: marks_total,
                  grade: marks_grade,
                });
              }
              //generate csv file
              //enrollment_csv
              stringify(
                enrollment_csv_data,
                {
                  header: true,
                },
                async function (err, output) {
                  fs.writeFile(enrollment_csv, output, 'utf8', function (err) {
                    if (err) {
                      done({
                        error: err,
                      });
                    } else {
                      //enrollment_csv
                      stringify(
                        assessment_csv_data,
                        {
                          header: true,
                        },
                        function (err, output) {
                          fs.writeFile(
                            assessment_csv,
                            output,
                            'utf8',
                            function (err) {
                              if (err) {
                                done({
                                  error: err,
                                });
                              } else {
                                done({
                                  Enrollment: enrollment_csv,
                                  Assessment: assessment_csv,
                                });
                              }
                            },
                          );
                        },
                      );
                    }
                  });
                },
              );
            });
            if (csv_files_status?.error) {
              spin.fail('CSV Files Creation Failed.');
              console.log(JSON.stringify(csv_files_status, null, '\t'));
            } else {
              spin.succeed('CSV Files Created.');
              console.log(JSON.stringify(csv_files_status, null, '\t'));
              //post generated files to bulk enrollment and bulk assance
            }
          }
        }
      }
    }

    /*
    spin.start(`Listing files in directory`);

    // simulate a long task of 1 seconds
    let files = await new Promise((done) =>
      setTimeout(() => done(['fileA', 'fileB']), 5000),
    );

    spin.succeed('Listing done');
    console.log(JSON.stringify(files));

    spin.start(`Listing files in directory`);

    // simulate a long task of 1 seconds
    files = await new Promise((done) =>
      setTimeout(() => done(['fileC', 'fileD']), 5000),
    );

    spin.succeed('Listing done');

    // send the response to the  cli
    // you could also use process.stdout.write()
    console.log(JSON.stringify(files));*/
  }
}
