export default {
  jobs: {
    run: {
      'runs-on': 'ubuntu-latest',
      steps: [
        { uses: 'actions/checkout@v2', with: { lfs: true } },
        {
          uses: 'tinovyatkin/action-check-deprecated-js-deps@v1',
          'continue-on-error': true,
          id: 'check-deprecated-js-deps',
        },
        {
          if: '${{ steps.check-deprecated-js-deps.outputs.deprecated }}',
          uses: 'JasonEtco/create-an-issue@v2',
          id: 'create-deprecation-issue',
          env: {
            GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
            DEPRECATED: "${{ steps.check-deprecated-js-deps.outputs.deprecated }}",
            RUN_URL: 'https://github.com/${{github.repository}}/actions/runs/${{github.run_id}}',
          },
          with: {
            update_existing: true,
            filename: '.github/DEPRECATED_DEPENDENCIES_ISSUE_TEMPLATE.md',
          },
        },
        {
          if: '${{ !steps.check-deprecated-js-deps.outputs.deprecated && steps.create-deprecation-issue.outputs.number }}',
          uses: 'peter-evans/close-issue@v1',
          with: {
            'issue-number': '${{ steps.create-deprecation-issue.outputs.number }}',
            comment: 'Auto-closing the issue',
          }
        }
      ],
    }
  },
  name: 'deprecated-dependencies',
  on: {
    push: {
      branches: ['dword-design/create-an-issue-if-224'],
    },
    schedule: [
      { cron: '0/15/30/45 * * * *' }
    ]
  },
}
