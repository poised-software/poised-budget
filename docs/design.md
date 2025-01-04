# Design Philosophy

There are two guiding principles to the design of Poised Budget:

1. Privacy is a human right: everyone should have *full* control over their data and how it is used.
1. Limit Dependencies

## 1. Privacy as a Human Right

Everyone has the right to their private information and to choose how, when and *if* they want to share it. In accordance with this, Poised Budget is built to be as low-trust as possible, not because you can't trust us, but because you shouldn't have to. This factors into several decisions made when developing this solution:

1. All code used within Poised Budget (including all dependencies) is open source.
1. The self-hosted model gives *you* full control over your data.
1. Once installed, Poised Budget does not communicate with any service other than the self-hosted server you set up and own.
1. The offline-first design allows you to run Poised Budget without ever connecting to the internet (once installed) as long as you do not wish to sync between devices.

The data is yours, so the choice is yours also.

## 2. Limit Dependencies

The main reason for limiting dependencies is to limit bloat. See [The Website Obesity Crisis](https://idlewords.com/talks/website_obesity.htm) for an informative and humorous insight into what is meant by "bloat". Unfortunately due to various limitations including the author's skill set, some dependencies will need to be used and a balance will need to be struck. We have chosen to go by the adage "Don't let perfection be the enemy of good", so there will be areas where this can be improved in the future. For a full list of our dependencies and their respective licenses and source locations, see the [DEPENDENCIES](./DEPENDENCIES.md) file.

## Why Zero-Based?

Zero-based budgeting is a clean and simple form of budgeting that is easily understood and helps the user to track every cent earned and spent. This helps minimize things "falling through the cracks" or being missed.